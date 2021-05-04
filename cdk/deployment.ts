import {
    Table,
    AttributeType,
    ProjectionType,
    BillingMode,
} from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { Topic } from '@aws-cdk/aws-sns';
import * as sqs from '@aws-cdk/aws-sqs';
import { EventBus, CfnRule } from '@aws-cdk/aws-events';
import { App, RemovalPolicy, Stack } from '@aws-cdk/core';
import {
    defaultDynamoDBSettings,
    generateResourceId,
    lambdaFactory,
    snsFilterHelper,
} from './cdk-helper';
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
    SystemLambdaSettings,
    UserLambdaSettings,
} from './settings/lambda-settings';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
//import {Role} from "@aws-cdk/aws-iam";
//import targets  from "@aws-cdk/aws-events-targets";
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

        this.useEventBridge(createLambda, bus);
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
        return users;
    }

    private createEndpoint(
        users: Table,
        usersApiEndpoint: Resource,
        bus: EventBus
    ): lambda.Function {
        const createOneSettings: UserLambdaSettings = {
            TABLE_NAME: users.tableName,
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            SYSTEM_EVENT_BUS_NAME: bus.eventBusName,
        };
        const createOne = lambdaFactory(
            this,
            generateResourceId(resources.lambdaCreateUser),
            'create/',
            this.lambdaSourceCode,
            (createOneSettings as unknown) as { [key: string]: string }
        );

        users.grantReadWriteData(createOne);

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

        const bus = new EventBus(
            this,
            generateResourceId(resources.systemEventBridge),
            {}
        );
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

        return bus;
    }

    private useEventBridge(lambda: lambda.Function, eb: EventBus) {
        eb.grantPutEventsTo(lambda);
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

    // private useSnsToConsumeSystemBus(){
    //     deletedEntitiesRule.addTarget(new targets.SnsTopic(topic, {
    //         message: RuleTargetInput.fromText(
    //             `Entity with id ${EventField.fromPath('$.detail.entity-id')} has been deleted by ${EventField.fromPath('$.detail.author')}`
    //         )
    //     }));
    // }

    // private useEventStoreToConsumeSystemBus(){
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
