export interface LambdaWithDynamoDbSettings {
    AWS_NODEJS_CONNECTION_REUSE_ENABLED: string;
}

export interface UserLambdaSettings extends LambdaWithDynamoDbSettings {
    TABLE_NAME: string;
    SYSTEM_EVENT_BUS_NAME: string;
}
export interface CreateUserApiLambdaSettings {
    SYSTEM_EVENT_BUS_NAME: string;
}

export interface CreateUserHandlerLambdaSettings
    extends LambdaWithDynamoDbSettings {
    USER_TABLE_NAME: string;
}

export interface SystemLambdaSettings extends LambdaWithDynamoDbSettings {
    SYSTEM_TABLE_NAME: string;
}
