import {
    Table,
    AttributeType,
    ProjectionType,
    BillingMode,
} from '@aws-cdk/aws-dynamodb';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { Topic } from '@aws-cdk/aws-sns';
import { EventBus, CfnRule } from '@aws-cdk/aws-events';
import { App, RemovalPolicy, Stack } from '@aws-cdk/core';
import {
    defaultDynamoDBSettings,
    generateResourceName,
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
import { UserLambdaSettings } from './settings/lambda-settings';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';

export class Deployment extends Stack {
    private lambdaSourceCode = 'assets/lambda/dist/handlers/';

    constructor(app: App, id: string) {
        super(app, id);

        const users = new Table(
            this,
            generateResourceName(resources.dynamoDbUserTable),
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
        const createOneSettings: UserLambdaSettings = {
            TABLE_NAME: users.tableName,
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        };
        const createOne = lambdaFactory(
            this,
            generateResourceName(resources.lambdaCreateUser),
            'create/',
            this.lambdaSourceCode,
            (createOneSettings as unknown) as { [key: string]: string }
        );

        users.grantReadWriteData(createOne);

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

        const createOneIntegration = new LambdaIntegration(createOne);
        usersApiEndpoint.addMethod('POST', createOneIntegration);
        addCorsOptions(usersApiEndpoint);

        this.getAllEndpoint(users, usersApiEndpoint);

        this.getByIdEndpoint(users, usersApiEndpoint);

        const topic = new Topic(
            this,
            generateResourceName(resources.snsUserCreatedTopic),
            {
                displayName: 'User Created Topic',
            }
        );
        this.setupSubscriptionsForEnvironment(
            topic,
            settings.snsUserNotificationEmails
        );

        this.setupEventBridge();
    }

    private getAllEndpoint(users: Table, usersApiEndpoint: Resource) {
        const getAllSettings: UserLambdaSettings = {
            TABLE_NAME: users.tableName,
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        };

        const getAll = lambdaFactory(
            this,
            generateResourceName(resources.lambdaGetAllUsers),
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
        };
        const getById = lambdaFactory(
            this,
            generateResourceName(resources.lambdaGetUserById),
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

    private setupEventBridge() {
        const logGroup = new LogGroup(
            this,
            generateResourceName(resources.systemEventBridgeLogGroup),
            {
                logGroupName: `/aws/events/${settings.environment}-system-events`,
                retention: RetentionDays.ONE_DAY,
            }
        );

        const bus = new EventBus(
            this,
            generateResourceName(resources.systemEventBridge),
            {}
        );

        // rule with cloudwatch log group as a target
        // (using CFN as L2 constructor doesn't allow prefix expressions)
        new CfnRule(
            this,
            generateResourceName(resources.systemCfnRulePushAllEvents),
            {
                eventBusName: bus.eventBusName,
                description: 'Rule matching all events',
                eventPattern: {
                    source: [{ prefix: '' }],
                },
                targets: [
                    {
                        id: `${settings.environment}-all-events-cw-logs`,
                        arn: `arn:aws:logs:${logGroup.stack.region}:${logGroup.stack.account}:log-group:${logGroup.logGroupName}`,
                    },
                ],
            }
        );
    }
}

const app = new App();
new Deployment(app, `${settings.environment}-${settings.repositoryName}`);
app.synth();
