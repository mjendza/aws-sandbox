export interface CdkResources {
    apiGateway: string;

    lambdaCreateUser: string;
    lambdaGetAllUsers: string;
    lambdaGetUserById: string;

    dynamoDbUserTable: string;

    snsUserCreatedTopic: string;

    systemEventBridge: string;
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

    dynamoDbUserTable: 'users',

    snsUserCreatedTopic: 'user-created-topic',

    systemEventBridge: 'system-event-bridge',
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
