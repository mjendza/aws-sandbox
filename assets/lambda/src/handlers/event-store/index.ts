import {
    SystemEventBridgeEvent,
    systemEventBridgeEventSchema,
} from '../../events/user-event';
import { validate } from '../../helpers/validation-helpers';
import {
    proxyIntegrationError,
    proxyIntegrationResult,
} from '../../helpers/proxy-integration';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as log from 'lambda-log';
import { dynamoClient } from '../../helpers/dynamodb-factory';
import { StoreSystemEventService } from '../../event-store/create-system-event-store-event-service';
import { SystemEventStoreRepository } from '../../event-store/system-event-push-repository';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        log.info(`event: ${JSON.stringify(event)}`);
        const model = validate<SystemEventBridgeEvent>(
            event,
            systemEventBridgeEventSchema
        );
        log.info(`model: ${JSON.stringify(model)}`);
        const service = new StoreSystemEventService(
            new SystemEventStoreRepository(dynamoClient())
        );
        const result = await service.create(model);
        log.info(`result: ${JSON.stringify(result)}`);
        const response = proxyIntegrationResult(201, {
            id: result,
        });
        log.info(`response: ${JSON.stringify(response)}`);
        return response;
    } catch (error) {
        return proxyIntegrationError(error);
    }
};
