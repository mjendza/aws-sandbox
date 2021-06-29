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
import { App, RemovalPolicy, Stack } from '@aws-cdk/core';
import {
    defaultDynamoDBSettings,
    generateResourceId,
    lambdaFactory,
    snsFilterHelper,
    ssmParameterBuilder,
} from './cdk-helper';
import {
    AwsCustomResource,
    AwsCustomResourcePolicy,
    PhysicalResourceId,
} from '@aws-cdk/custom-resources';
import {
    LambdaIntegration,
    MethodLoggingLevel,
    Resource,
    RestApi,
} from '@aws-cdk/aws-apigateway';
import { addCorsOptions } from './deployment-base';
import * as settings from './settings.json';
import { resources } from './cdk-resources';
import {
    CreatedUserEventPublisherLambdaSettings,
    CreateUserApiLambdaSettings,
    CreateUserHandlerLambdaSettings,
    UserLambdaSettings,
} from './settings/lambda-settings';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { UserEvents } from '../assets/lambda/src/events/user-event';
import { SystemLambdaSettings } from './settings/system-lambda-settings';
import {
    useEventBridge,
    useEventBridgeLambdaHandler,
} from './helpers/event-bridge/lambda-helpers';
import { StartingPosition } from '@aws-cdk/aws-lambda';
import { paymentFlowLambda } from './payment-flow/infrastructure';

export class Deployment extends Stack {
    private lambdaSourceCode = 'assets/lambda/dist/handlers/';

    constructor(app: App, id: string) {
        super(app, id);

        const users = this.createUsersTable();

        const eventStorage = this.createSystemEventStoreTable();
        const eventStoreHandler = this.systemEventStoreLambda(eventStorage);

        const bus = this.setupEventBridge(eventStoreHandler);
        const api = new RestApi(
            this,
            `api-gateway-${settings.repositoryName}`,

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
        const usersApiEndpoint = api.root.addResource('users');

        const createLambda = this.createEndpoint(users, usersApiEndpoint, bus);

        const createUserHandler = this.createUserEventHandlerLambda(users, bus);

        this.createdUserEventPublisherLambda(users, bus);

        paymentFlowLambda(this, this.lambdaSourceCode, bus);

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

        useEventBridge(createLambda, bus);
        useEventBridge(createUserHandler, bus);
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
        users: Table,
        usersApiEndpoint: Resource,
        bus: EventBus
    ): lambda.Function {
        const createOneSettings: CreateUserApiLambdaSettings = {
            SYSTEM_EVENT_BUS_NAME: bus.eventBusName,
        };
        const createOne = lambdaFactory(
            this,
            generateResourceId(resources.lambdaCreateUser),
            'create/',
            this.lambdaSourceCode,
            (createOneSettings as unknown) as { [key: string]: string }
        );

        const createOneIntegration = new LambdaIntegration(createOne);
        usersApiEndpoint.addMethod('POST', createOneIntegration);
        addCorsOptions(usersApiEndpoint);
        return createOne;
    }

    private getAllEndpoint(users: Table, usersApiEndpoint: Resource) {
        const getAllSettings: UserLambdaSettings = {
            TABLE_NAME: users.tableName,
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            SYSTEM_EVENT_BUS_NAME: '',
        };

        const getAll = lambdaFactory(
            this,
            generateResourceId(resources.lambdaGetAllUsers),
            'get-all/',
            this.lambdaSourceCode,
            (getAllSettings as unknown) as { [key: string]: string }
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
        const getById = lambdaFactory(
            this,
            generateResourceId(resources.lambdaGetUserById),
            'get-by-id/',
            this.lambdaSourceCode,
            (getByIdSettings as unknown) as { [key: string]: string }
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

    private setupEventBridge(eventStoreHandler: lambda.Function): EventBus {
        const logGroup = new LogGroup(
            this,
            generateResourceId(resources.systemEventBridgeLogGroup),
            {
                logGroupName: `/aws/events/${settings.environment}-system-events`,
                retention: RetentionDays.ONE_DAY,
            }
        );
        const busId = generateResourceId(resources.systemEventBridge);
        const bus = new EventBus(this, busId, {});
        const ssmId = generateResourceId(`${busId}StringParameter`);
        const ssmName = ssmParameterBuilder(busId);
        new StringParameter(this, ssmId, {
            description: busId,
            parameterName: ssmName,
            stringValue: bus.eventBusName,
            // allowedPattern: '.*',
        });

        const queue = new sqs.Queue(this, resources.systemEventBridgeDlq);

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

    private createSystemEventStoreTable(): Table {
        const users = new Table(
            this,
            generateResourceId(resources.dynamoDbEventStoreTable),
            {
                partitionKey: {
                    name: 'id',
                    type: AttributeType.STRING,
                },
                billingMode: BillingMode.PAY_PER_REQUEST,
                replicationRegions: defaultDynamoDBSettings.replicationRegions,

                // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
                // the new table, and it will remain in your account until manually deleted. By setting the policy to
                // DESTROY, cdk destroy will delete the table (even if it has data in it)
                removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
            }
        );

        return users;
    }

    private createdUserEventPublisherLambda(
        users: Table,
        systemBus: EventBus
    ): lambda.Function {
        const settings: CreatedUserEventPublisherLambdaSettings = {
            SYSTEM_EVENT_BUS_NAME: systemBus.eventBusName,
        };
        const lambda = lambdaFactory(
            this,
            generateResourceId(resources.lambdaCreatedUserEventPublisher),
            'created-user-publisher/',
            this.lambdaSourceCode,
            (settings as unknown) as { [key: string]: string }
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
        systemBus: EventBus
    ): lambda.Function {
        const createUserHandlerSettings: CreateUserHandlerLambdaSettings = {
            USER_TABLE_NAME: userTable.tableName,
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            SYSTEM_EVENT_BUS_NAME: systemBus.eventBusName,
        };
        const lambda = lambdaFactory(
            this,
            generateResourceId(resources.lambdaCreateUserEventHandler),
            'create-user/',
            this.lambdaSourceCode,
            (createUserHandlerSettings as unknown) as { [key: string]: string }
        );

        userTable.grantReadWriteData(lambda);

        useEventBridgeLambdaHandler(
            this,
            UserEvents.CreateUser,
            lambda,
            systemBus,
            resources.eventRuleCreateUserHandler
        );

        return lambda;
    }

    private systemEventStoreLambda(eventStore: Table): lambda.Function {
        const createOneSettings: SystemLambdaSettings = {
            SYSTEM_TABLE_NAME: eventStore.tableName,
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        };
        const createOne = lambdaFactory(
            this,
            generateResourceId(resources.lambdaEventStore),
            'event-store/',
            this.lambdaSourceCode,
            (createOneSettings as unknown) as { [key: string]: string }
        );

        eventStore.grantReadWriteData(createOne);

        return createOne;
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

const app = new App();
new Deployment(app, `${settings.environment}-${settings.repositoryName}`);
app.synth();
