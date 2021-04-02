
import { UserEntity } from './userEntity';
import { getEnvironmentSettingsKey } from '../helpers/validation-helpers';
import { UserLambdaSettings } from '../../../../cdk/settings/lambda-settings';
import {dynamoClient} from "../helpers/dynamodb-factory";
import { DynamoDB } from 'aws-sdk';

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;
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
            const errorResponse =
                dbError.code === 'ValidationException' &&
                dbError.message.includes('reserved keyword')
                    ? DYNAMODB_EXECUTION_ERROR
                    : RESERVED_RESPONSE;
            throw new Error(`DynamoDB ERROR: ${errorResponse}`);
        }
    }
}
