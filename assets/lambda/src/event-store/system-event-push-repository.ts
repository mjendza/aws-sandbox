import {
    getEnvironmentSettingsKey,
    validateEntity,
} from '../helpers/validation-helpers';
import { SystemLambdaSettings } from '../../../../cdk/settings/lambda-settings';
import { DynamoDB } from 'aws-sdk';
import * as log from 'lambda-log';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { LambdaProxyError } from '../helpers/lambda-proxy-error';
import {
    SystemEventEntity,
    systemEventEntitySchema,
} from './create-system-event-store-event-service';

export class SystemEventStoreRepository {
    private tableName = getEnvironmentSettingsKey<SystemLambdaSettings>(
        'SYSTEM_TABLE_NAME'
    );

    constructor(private documentClient: DynamoDB.DocumentClient) {}

    async put(item: SystemEventEntity): Promise<void> {
        const params = {
            TableName: this.tableName,
            Item: item,
        };
        log.info(`DynamoDB params: ${JSON.stringify(params)}`);
        validateEntity<SystemEventEntity>(item, systemEventEntitySchema);
        const result = await this.documentClient.put(params).promise();
        log.info(`DynamoDB result: ${JSON.stringify(result)}`);
    }

    async get(id: string): Promise<SystemEventEntity> {
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
        const model = validateEntity<SystemEventEntity>(
            result.Item,
            systemEventEntitySchema
        );
        return model;
    }
}
