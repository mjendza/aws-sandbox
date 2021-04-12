import { UserEntity, userEntitySchema } from './user-entity';
import {
    getEnvironmentSettingsKey,
    validateEntity,
} from '../helpers/validation-helpers';
import { UserLambdaSettings } from '../../../../cdk/settings/lambda-settings';
import { DynamoDB } from 'aws-sdk';
import * as log from 'lambda-log';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export class UserRepository {
    private tableName = getEnvironmentSettingsKey<UserLambdaSettings>(
        'TABLE_NAME'
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
        try {
            const result = await this.documentClient.get(params).promise();
            const model = validateEntity<UserEntity>(
                result.Item,
                userEntitySchema
            );
            return model;
        } catch (dbError) {
            log.error(`DynamoDB ERROR: ${JSON.stringify(dbError)}`);
            throw new Error(`DynamoDB ERROR: ${dbError}`);
        }
    }
}
