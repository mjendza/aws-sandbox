export interface LambdaWithDynamoDbSettings {
    AWS_NODEJS_CONNECTION_REUSE_ENABLED: string;
}

export interface UserLambdaSettings extends LambdaWithDynamoDbSettings {
    TABLE_NAME: string;
    EVENT_BUS_NAME: string;
}
