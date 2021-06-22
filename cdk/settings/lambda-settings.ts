import { LambdaWithDynamoDbSettings } from './lambda-with-dynamo-db-settings';
import { UseSystemEventBusLambdaSettings } from './use-system-event-bus-lambda-settings';

export interface UserLambdaSettings extends LambdaWithDynamoDbSettings {
    TABLE_NAME: string;
    SYSTEM_EVENT_BUS_NAME: string;
}
export interface CreateUserApiLambdaSettings {
    SYSTEM_EVENT_BUS_NAME: string;
}

export interface CreateUserHandlerLambdaSettings
    extends LambdaWithDynamoDbSettings,
        UseSystemEventBusLambdaSettings {
    USER_TABLE_NAME: string;
}
