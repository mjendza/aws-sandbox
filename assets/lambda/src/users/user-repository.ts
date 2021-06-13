import { UserEntity, userEntitySchema } from './user-entity';
import {
    getEnvironmentSettingsKey,
    validateEntity,
} from '../helpers/validation-helpers';
import { CreateUserHandlerLambdaSettings } from '../../../../cdk/settings/lambda-settings';
import { DynamoDB } from 'aws-sdk';
import * as log from 'lambda-log';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { LambdaProxyError } from '../helpers/lambda-proxy-error';

export class UserRepository {
    private tableName = getEnvironmentSettingsKey<CreateUserHandlerLambdaSettings>(
        'USER_TABLE_NAME'
    );

    constructor(private documentClient: DynamoDB.DocumentClient) {}

    async put(item: UserEntity): Promise<void> {
        const params = {
            TableName: this.tableName,
            Item: item,
        };
        log.info(`DynamoDB params: ${JSON.stringify(params)}`);
        try {
            await this.documentClient.put(params).promise();
        } catch (dbError) {
            log.error(`DynamoDB ERROR: ${JSON.stringify(dbError)}`);
            throw new Error(`DynamoDB ERROR: ${dbError}`);
        }
    }

    async get(id: string): Promise<UserEntity> {
        const params: DocumentClient.GetItemInput = {
            TableName: this.tableName,
            Key: {
                ['id']: id,
            },
        };
        log.info(`DynamoDB params: ${JSON.stringify(params)}`);

        const result = await this.documentClient.get(params).promise();
        if (!result.Item) {
            throw new LambdaProxyError(404, 'User does not exists.');
        }
        log.info(`DynamoDB result: ${JSON.stringify(result.Item)}`);
        const model = validateEntity<UserEntity>(result.Item, userEntitySchema);
        return model;
    }
}
