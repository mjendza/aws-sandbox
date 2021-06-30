export interface CdkResources {
    apiGateway: string;

    lambdaCreateUser: string;
    lambdaGetAllUsers: string;
    lambdaGetUserById: string;

    lambdaCreateUserEventHandler: string;
    lambdaCreatedUserEventPublisher: string;
    eventRuleCreateUserHandler: string;
    lambdaPaymentFlowEventHandler: string;
    eventRuleUserCreatedHandler: string;

    dynamoDbUserTable: string;
    dynamoDbUserHomeRegionSortedGSI: string;

    sqsUserEventsDeadLetterQueue: string;
    snsUserCreatedTopic: string;

    systemEventBridge: string;
    systemEventBridgeRole: string;
    systemEventBridgeDlq: string;

    systemEventBridgeLogGroup: string;
    systemAllEventsBusRule: string;
    systemCfnRulePushAllEvents: string;
    lambdaEventStore: string;
    dynamoDbEventStoreTable: string;
}

export const resources: CdkResources = {
    apiGateway: 'api',

    lambdaCreateUser: 'lambda-users-create',
    lambdaGetAllUsers: 'lambda-users-get-all',
    lambdaGetUserById: 'lambda-user-get-by-id',

    lambdaCreateUserEventHandler: 'lambda-create-user-event-handler',
    lambdaCreatedUserEventPublisher: 'lambda-created-user-event-publisher',
    eventRuleCreateUserHandler: 'rule-create-user-event-handler',
    lambdaPaymentFlowEventHandler: 'lambda-payment-flow-event-handler',
    eventRuleUserCreatedHandler: 'rule-user-created-event-handler',

    dynamoDbUserTable: 'users',
    dynamoDbUserHomeRegionSortedGSI: 'homeRegion',

    sqsUserEventsDeadLetterQueue: 'sqs-users-event-dlq',
    snsUserCreatedTopic: 'user-created-topic',

    systemEventBridge: 'system-event-bridge',
    systemEventBridgeRole: 'system-event-bridge-role',
    systemEventBridgeDlq: 'system-event-bridge-dead-letter-queue',
    systemEventBridgeLogGroup: 'system-event-bridge-log-group',
    systemAllEventsBusRule: 'system-all-events-bus-rule',
    systemCfnRulePushAllEvents: 'system-cfn-rule-push-all-events',
    lambdaEventStore: 'system-event-store-lambda',
    dynamoDbEventStoreTable: 'system-event-store',
};

export interface UserCreated {
    id: string;
    email: string;
    createdAt: string;
}
