import { UserEntity } from './userEntity';
import { getEnvironmentSettingsKey } from '../helpers/validation-helpers';
import { UserLambdaSettings } from '../../../../cdk/settings/lambda-settings';
import { dynamoClient } from '../helpers/dynamodb-factory';
import { DynamoDB } from 'aws-sdk';

export class UserRepository {
    private documentClient: DynamoDB.DocumentClient;
    private tableName = getEnvironmentSettingsKey<UserLambdaSettings>(
        'TABLE_NAME'
    );
    constructor() {
        this.documentClient = dynamoClient();
    }
    async put(item: UserEntity): Promise<void> {
        const params = {
            TableName: this.tableName,
            Item: item,
        };
        try {
            await this.documentClient.put(params).promise();
        } catch (dbError) {
            throw new Error(`DynamoDB ERROR: ${dbError}`);
        }
    }
}
