export interface CdkResources {
    apiGateway: string;

    lambdaCreateUser: string;
    lambdaGetAllUsers: string;
    lambdaGetUserById: string;

    lambdaCreateUserEventHandler: string;
    lambdaCreatedUserEventPublisher: string;
    eventRuleCreateUserHandler: string;
    lambdaPaymentFlowErrorEventHandler: string;
    lambdaPaymentFlowNoPermissionsEventHandler: string;
    eventRuleUserCreatedPaymentFlowErrorHandler: string;
    eventRuleUserCreatedPaymentFlowNoPermissionsHandler: string;

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

    alarmSqs: string;
    alarmSns: string;
}

export const resources: CdkResources = {
    apiGateway: 'api',

    lambdaCreateUser: 'lambda-users-rest-api-create',
    lambdaGetAllUsers: 'lambda-users-rest-api-get-all',
    lambdaGetUserById: 'lambda-user-rest-api-get-by-id',

    lambdaCreateUserEventHandler: 'lambda-create-user-event-handler',
    lambdaCreatedUserEventPublisher: 'lambda-created-user-event-publisher',
    eventRuleCreateUserHandler: 'rule-create-user-event-handler',
    lambdaPaymentFlowErrorEventHandler:
        'lambda-payment-flow-error-event-handler',
    lambdaPaymentFlowNoPermissionsEventHandler:
        'lambda-payment-flow-no-permissions-event-handler',
    eventRuleUserCreatedPaymentFlowErrorHandler: 'rule-user-created-payment-error-event-handler',
    eventRuleUserCreatedPaymentFlowNoPermissionsHandler: 'rule-user-created-payment-no-permissions-event-handler',

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

    alarmSqs: 'alarm-sqs-queue',
    alarmSns: 'alarm-sns',
};
