import { UserEntity, userEntitySchema } from './user-entity';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as log from 'lambda-log';
import { LambdaProxyError } from '../helpers/lambda-proxy-error';
import { validateEntity } from '../helpers/validation-helpers';
import { DynamoDB } from 'aws-sdk';
import { getEnvironmentSettingsKey } from '../helpers/get-environment-settings-key';
import { CreateUserHandlerLambdaSettings } from '../../../cdk/core/settings/lambda-settings';

export class GetUserService {
    constructor(private documentClient: DynamoDB.DocumentClient) {}
    private tableName =
        getEnvironmentSettingsKey<CreateUserHandlerLambdaSettings>(
            'USER_TABLE_NAME'
        );
    static IndexSeparator: string = '_';
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
