import { UserEntity } from './user-entity';
import { CreateUserEvent } from '../events/user-event';
import { DynamoDB } from 'aws-sdk';
import * as log from 'lambda-log';
import { getEnvironmentSettingsKey } from '../helpers/get-environment-settings-key';
import { CreateUserHandlerLambdaSettings } from '../../../cdk/core/settings/lambda-settings';

export class CreateUserService {
    constructor(private documentClient: DynamoDB.DocumentClient) {}
    private tableName =
        getEnvironmentSettingsKey<CreateUserHandlerLambdaSettings>(
            'USER_TABLE_NAME'
        );
    static IndexSeparator: string = '_';
    async create(model: CreateUserEvent): Promise<string> {
        const entity: UserEntity = {
            id: model.id,
            email: model.email,
            createdAt: new Date(Date.now()).toISOString(),
            tags: [],
            homeRegion: `eu-central-1`,
        };
        const params = {
            TableName: this.tableName,
            Item: entity,
        };
        log.info(`DynamoDB params: ${JSON.stringify(params)}`);
        try {
            await this.documentClient.put(params).promise();
        } catch (dbError) {
            log.error(`DynamoDB ERROR: ${JSON.stringify(dbError)}`);
            throw new Error(`DynamoDB ERROR: ${dbError}`);
        }
        return entity.id;
    }
}
