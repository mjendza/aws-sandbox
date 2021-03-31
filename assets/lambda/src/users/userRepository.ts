import { DynamoDB } from 'aws-sdk';
import { UserEntity } from './userEntity';

const TABLE_NAME = process.env.TABLE_NAME || '';

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;
export class UserRepository {
    private documentClient: DynamoDB.DocumentClient;
    constructor() {
        this.documentClient = new DynamoDB.DocumentClient();
    }
    async put(item: UserEntity): Promise<void> {
        const params = {
            TableName: TABLE_NAME,
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
