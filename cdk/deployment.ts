import {
    AttributeType,
    BillingMode,
    ProjectionType,
    StreamViewType,
    Table,
} from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import { PolicyStatement, ServicePrincipal } from '@aws-cdk/aws-iam';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { Topic } from '@aws-cdk/aws-sns';
import * as sqs from '@aws-cdk/aws-sqs';
import { CfnRule, EventBus } from '@aws-cdk/aws-events';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import {
    App,
    CfnOutput,
    RemovalPolicy,
    Stack,
    StackProps,
} from '@aws-cdk/core';
import {
    defaultDynamoDBSettings,
    generateResourceId,
    snsFilterHelper,
    ssmParameterBuilder,
} from './helpers/cdk-helper';
import {
    AwsCustomResource,
    AwsCustomResourcePolicy,
    PhysicalResourceId,
} from '@aws-cdk/custom-resources';
import {
    CfnAuthorizer,
    LambdaIntegration,
    MethodLoggingLevel,
    Resource,
    RestApi,
} from '@aws-cdk/aws-apigateway';
import { addMethodWithAuthorization } from './helpers/api-gateway/helper';
import * as settings from './settings.json';
import { resources } from './cdk-resources';
import {
    CreatedUserEventPublisherLambdaSettings,
    CreateUserApiLambdaSettings,
    CreateUserHandlerLambdaSettings,
    UserLambdaSettings,
} from './settings/lambda-settings';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { UserEvents } from '../bin/src/events/user-event';
import {
    assignPermissionToLambdaToPushEvent,
    useEventBridgeLambdaHandler,
} from './helpers/event-bridge/lambda-helpers';
import { StartingPosition } from '@aws-cdk/aws-lambda';
import {
    paymentFlowErrorLambda,
    paymentFlowNoPermissionsLambda,
} from './payment-flow/infrastructure';
import { IQueue } from '@aws-cdk/aws-sqs';
import { Watchful } from 'cdk-watchful';
import { lambdaBuilder } from './helpers/lambda/lambda-builder';
import { setupAppSync } from './app-sync-api';
import {
    createSystemEventStoreTable,
    systemEventStoreLambda,
} from './event-store/creators';
import {
    authorizeApiWithCognitoPool,
    createIdentityPool,
    createUserPoolWithEmailSignIn,
    rolesForUsers,
    userPoolClientProps,
} from './helpers/cognito/helper';

export class Deployment extends Stack {
    private lambdaSourceCode = 'bin/dist/handlers/';

    constructor(app: App, id: string, prop: StackProps) {
        super(app, id, prop);

        const users = this.createUsersTable();

        const eventStorage = createSystemEventStoreTable(this);
        const eventStoreHandler = systemEventStoreLambda(
            this,
            eventStorage,
            this.lambdaSourceCode
        );
        const systemEventBridgeDeadLetterQueue = new sqs.Queue(
            this,
            resources.systemEventBridgeDlq
        );
        const bus = this.setupEventBridge(
            eventStoreHandler,
            systemEventBridgeDeadLetterQueue
        );
        const lambdaDlq = new sqs.Queue(this, resources.sqsLambdaAsyncDlq);

        const api = new RestApi(
            this,
            generateResourceId(resources.apiGateway),
            {
                restApiName: `api-${settings.repositoryName}`,
                deployOptions: {
                    stageName: 'beta',
                    metricsEnabled: true,
                    loggingLevel: MethodLoggingLevel.ERROR,
                    dataTraceEnabled: true,
                    tracingEnabled: true,
                },
            }
        );
        const userPool = createUserPoolWithEmailSignIn(
            this,
            generateResourceId(resources.cognitoUserPool)
        );
        const userPoolClient = userPool.addClient(
            generateResourceId(resources.cognitoUserPoolClient),
            userPoolClientProps(userPool)
        );
        const userPoolIdentityPool = createIdentityPool(
            this,
            generateResourceId(resources.cognitoIdentityPool),
            userPool,
            userPoolClient
        );
        rolesForUsers(this, userPool, userPoolClient, userPoolIdentityPool);

        new CfnOutput(
            this,
            `${generateResourceId(resources.cognitoUserPool)}-Output`,
            {
                value: userPoolIdentityPool.ref,
            }
        );
        new CfnOutput(
            this,
            `${generateResourceId(
                resources.cognitoUserPoolClient
            )}-userPoolClientId`,
            {
                value: userPoolClient.userPoolClientId,
            }
        );
        new CfnOutput(
            this,
            `${generateResourceId(resources.cognitoIdentityPool)}-Output`,
            {
                value: userPool.userPoolArn,
            }
        );
        ssmParameterBuilder(
            this,
            `${generateResourceId(resources.cognitoUserPool)}-Parameter`,
            userPool.userPoolId
        );

        const authorizer = authorizeApiWithCognitoPool(
            this,
            api,
            userPool,
            generateResourceId(resources.apiAuthorizer)
        );
        setupAppSync(this, users);

        const usersApiEndpoint = api.root.addResource('users');

        this.createEndpoint(usersApiEndpoint, bus, authorizer);

        this.createUserEventHandlerLambda(
            users,
            bus,
            systemEventBridgeDeadLetterQueue,
            lambdaDlq
        );

        this.createdUserEventPublisherLambda(users, bus);

        paymentFlowErrorLambda(
            this,
            this.lambdaSourceCode,
            bus,
            systemEventBridgeDeadLetterQueue,
            lambdaDlq
        );
        paymentFlowNoPermissionsLambda(
            this,
            this.lambdaSourceCode,
            bus,
            systemEventBridgeDeadLetterQueue,
            lambdaDlq
        );

        this.getAllEndpoint(users, usersApiEndpoint);

        this.getByIdEndpoint(users, usersApiEndpoint);

        const topic = new Topic(
            this,
            generateResourceId(resources.snsUserCreatedTopic),
            {
                displayName: 'User Created Topic',
            }
        );

        this.setupSubscriptionsForEnvironment(
            topic,
            settings.snsUserNotificationEmails
        );

        const alarmSqs = new sqs.Queue(this, resources.alarmSqs);
        const alarmSns = new Topic(this, resources.alarmSns);

        const wf = new Watchful(this, 'watchful', {
            //alarmEmail: 'your@email.com',
            alarmSqs,
            alarmSns,
        });
        wf.watchApiGateway('REST', api);
        wf.watchDynamoTable('EventStore', eventStorage);
        wf.watchDynamoTable('Users', users);
    }

    private createUsersTable(): Table {
        const users = new Table(
            this,
            generateResourceId(resources.dynamoDbUserTable),
            {
                partitionKey: {
                    name: 'id',
                    type: AttributeType.STRING,
                },
                billingMode: BillingMode.PAY_PER_REQUEST,
                replicationRegions: defaultDynamoDBSettings.replicationRegions,
                stream: StreamViewType.NEW_AND_OLD_IMAGES,
                // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
                // the new table, and it will remain in your account until manually deleted. By setting the policy to
                // DESTROY, cdk destroy will delete the table (even if it has data in it)
                removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
            }
        );

        users.addGlobalSecondaryIndex({
            indexName: 'email',
            partitionKey: { name: 'email', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });

        users.addGlobalSecondaryIndex({
            indexName: resources.dynamoDbUserHomeRegionSortedGSI,
            partitionKey: { name: 'homeRegion', type: AttributeType.STRING },
            sortKey: {
                name: 'createdAt',
                type: AttributeType.STRING,
            },
            projectionType: ProjectionType.ALL,
        });

        return users;
    }

    private createEndpoint(
        usersApiEndpoint: Resource,
        bus: EventBus,
        autorizer: CfnAuthorizer
    ): lambda.Function {
        const createOneSettings: CreateUserApiLambdaSettings = {
            SYSTEM_EVENT_BUS_NAME: bus.eventBusName,
        };
        const createOne = lambdaBuilder(
            this,
            generateResourceId(resources.lambdaCreateUser),
            'create/',
            this.lambdaSourceCode,
            createOneSettings as unknown as { [key: string]: string },
            undefined
        );
        addMethodWithAuthorization(
            usersApiEndpoint,
            'POST',
            createOne,
            autorizer
        );
        assignPermissionToLambdaToPushEvent(createOne, bus);
        return createOne;
    }

    private getAllEndpoint(users: Table, usersApiEndpoint: Resource) {
        const getAllSettings: UserLambdaSettings = {
            TABLE_NAME: users.tableName,
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            SYSTEM_EVENT_BUS_NAME: '',
        };

        const getAll = lambdaBuilder(
            this,
            generateResourceId(resources.lambdaGetAllUsers),
            'get-all/',
            this.lambdaSourceCode,
            getAllSettings as unknown as { [key: string]: string },
            undefined
        );
        users.grantReadData(getAll);
        const getAllIntegration = new LambdaIntegration(getAll);
        usersApiEndpoint.addMethod('GET', getAllIntegration);
    }

    private getByIdEndpoint(users: Table, usersApiEndpoint: Resource) {
        const getByIdSettings: UserLambdaSettings = {
            TABLE_NAME: users.tableName,
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            SYSTEM_EVENT_BUS_NAME: '',
        };
        const getById = lambdaBuilder(
            this,
            generateResourceId(resources.lambdaGetUserById),
            'get-by-id/',
            this.lambdaSourceCode,
            getByIdSettings as unknown as { [key: string]: string },
            undefined
        );
        users.grantReadData(getById);
        const getByIdIntegration = new LambdaIntegration(getById);
        const singleItem = usersApiEndpoint.addResource('{id}');
        singleItem.addMethod('GET', getByIdIntegration);
    }

    private setupSubscriptionsForEnvironment(topic: Topic, emails: string[]) {
        const filter = snsFilterHelper();
        emails.map((email) =>
            topic.addSubscription(new EmailSubscription(email, filter))
        );
    }

    private setupEventBridge(
        eventStoreHandler: lambda.Function,
        queue: IQueue
    ): EventBus {
        const logGroup = new LogGroup(
            this,
            generateResourceId(resources.systemEventBridgeLogGroup),
            {
                logGroupName: `/aws/events/${settings.environment}/${settings.repositoryName}-system-events`,
                retention: RetentionDays.ONE_MONTH,
            }
        );
        const busId = generateResourceId(resources.systemEventBridge);
        const bus = new EventBus(this, busId, {});

        ssmParameterBuilder(this, `${busId}-Parameter`, bus.eventBusName);

        // rule with cloudwatch log group as a target
        // (using CFN as L2 constructor doesn't allow prefix expressions)
        const allEventsRule = new CfnRule(
            this,
            generateResourceId(resources.systemCfnRulePushAllEvents),
            {
                eventBusName: bus.eventBusName,
                description: 'Rule matching all events',
                eventPattern: {
                    source: [{ prefix: '' }],
                },
                targets: [
                    {
                        id: `${settings.environment}-all-events-cw-logs`,
                        arn: logGroup.logGroupArn,
                    },
                    {
                        id: `${settings.environment}-all-events-event-store`,
                        arn: eventStoreHandler.functionArn,
                        deadLetterConfig: {
                            arn: queue.queueArn,
                        },
                    },
                ],
            }
        );
        queue.addToResourcePolicy(
            new iam.PolicyStatement({
                actions: ['sqs:SendMessage'],
                resources: [queue.queueArn],
                principals: [new iam.ServicePrincipal('events.amazonaws.com')],
                conditions: {
                    ArnEquals: { 'aws:SourceArn': allEventsRule.attrArn },
                },
            })
        );
        eventStoreHandler.addPermission('invoke-eventStoreHandler', {
            principal: new ServicePrincipal('events.amazonaws.com'),
            sourceArn: allEventsRule.attrArn,
        });

        this.grantWriteLogsForRule(logGroup.logGroupArn);

        return bus;
    }

    private createdUserEventPublisherLambda(
        users: Table,
        systemBus: EventBus
    ): lambda.Function {
        const settings: CreatedUserEventPublisherLambdaSettings = {
            SYSTEM_EVENT_BUS_NAME: systemBus.eventBusName,
        };
        const lambda = lambdaBuilder(
            this,
            generateResourceId(resources.lambdaCreatedUserEventPublisher),
            'created-user-publisher/',
            this.lambdaSourceCode,
            settings as unknown as { [key: string]: string },
            undefined
        );

        lambda.addEventSource(
            new DynamoEventSource(users, {
                startingPosition: StartingPosition.LATEST,
            })
        );
        systemBus.grantPutEventsTo(lambda);

        return lambda;
    }

    private createUserEventHandlerLambda(
        userTable: Table,
        systemBus: EventBus,
        queue: IQueue,
        asyncLambdaDlq: IQueue
    ): lambda.Function {
        const createUserHandlerSettings: CreateUserHandlerLambdaSettings = {
            USER_TABLE_NAME: userTable.tableName,
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            SYSTEM_EVENT_BUS_NAME: systemBus.eventBusName,
        };
        const lambda = lambdaBuilder(
            this,
            generateResourceId(resources.lambdaCreateUserEventHandler),
            'create-user/',
            this.lambdaSourceCode,
            createUserHandlerSettings as unknown as { [key: string]: string },
            asyncLambdaDlq
        );

        userTable.grantReadWriteData(lambda);

        useEventBridgeLambdaHandler(
            this,
            UserEvents.CreateUser,
            lambda,
            systemBus,
            resources.eventRuleCreateUserHandler,
            queue
        );

        return lambda;
    }

    private grantWriteLogsForRule(logGroupArn: string) {
        // Cloudwatch logs have global resource policies that allow EventBridge to
        // write logs to a given Cloudwatch Log group. That's currently not exposed
        // via CloudFormation, so we use a Custom Resource here.
        // See https://github.com/aws/aws-cdk/issues/5343
        const policyName = `${this.stackName}-EventBridgeToCloudWatchPolicy`;
        new AwsCustomResource(this, 'CloudwatchLogResourcePolicy', {
            resourceType: 'Custom::CloudwatchLogResourcePolicy',
            onUpdate: {
                service: 'CloudWatchLogs',
                action: 'putResourcePolicy',
                parameters: {
                    policyName,
                    // PolicyDocument must be provided as a string, so we can't use the iam.PolicyDocument provisions
                    // or other CDK niceties here.
                    policyDocument: JSON.stringify({
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Sid: policyName,
                                Effect: 'Allow',
                                Principal: {
                                    Service: ['events.amazonaws.com'],
                                },
                                Action: [
                                    'logs:CreateLogStream',
                                    'logs:PutLogEvents',
                                    'logs:PutLogEventsBatch',
                                ],
                                Resource: logGroupArn,
                            },
                        ],
                    }),
                },
                physicalResourceId: PhysicalResourceId.of(policyName),
            },
            onDelete: {
                service: 'CloudWatchLogs',
                action: 'deleteResourcePolicy',
                parameters: {
                    policyName,
                },
            },
            policy: AwsCustomResourcePolicy.fromStatements([
                new PolicyStatement({
                    actions: [
                        'logs:PutResourcePolicy',
                        'logs:DeleteResourcePolicy',
                    ],
                    // Resource Policies are global in Cloudwatch Logs per-region, per-account.
                    resources: ['*'],
                }),
            ]),
        });
    }

    // private useSnsToConsumeSystemBus(){
    //     deletedEntitiesRule.addTarget(new targets.SnsTopic(topic, {
    //         message: RuleTargetInput.fromText(
    //             `Entity with id ${EventField.fromPath('$.detail.entity-id')} has been deleted by ${EventField.fromPath('$.detail.author')}`
    //         )
    //     }));
    // }
}
console.log(`CDK_DEFAULT_ACCOUNT: ${process.env['CDK_DEFAULT_ACCOUNT']}`);
console.log(`CDK_DEFAULT_REGION: ${process.env['CDK_DEFAULT_REGION']}`);
const app = new App();
new Deployment(app, `${settings.environment}-${settings.repositoryName}`, {
    env: {
        account: process.env['CDK_DEFAULT_ACCOUNT'],
        region: process.env['CDK_DEFAULT_REGION'],
    },
});
app.synth();
