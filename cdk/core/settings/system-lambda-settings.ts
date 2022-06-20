import { LambdaWithDynamoDbSettings } from './lambda-with-dynamo-db-settings';

export interface SystemLambdaSettings extends LambdaWithDynamoDbSettings {
    SYSTEM_TABLE_NAME: string;
}
