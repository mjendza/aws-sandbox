import {
    SystemEventStoreEvent,
    systemSEventStoreEventSchema,
} from '../../events/user-event';
import { validate } from '../../helpers/validation-helpers';
import {
    proxyIntegrationError,
    proxyIntegrationResult,
} from '../../helpers/proxy-integration';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as log from 'lambda-log';
import { dynamoClient } from '../../helpers/dynamodb-factory';
import { SystemEventRepository } from '../../event-store/system-event-repository';
import { CreateSystemEventStoreEventService } from '../../event-store/create-system-event-store-event-service';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        log.info(`event: ${JSON.stringify(event)}`);
        const model = validate<SystemEventStoreEvent>(
            event,
            systemSEventStoreEventSchema
        );
        log.info(`model: ${JSON.stringify(model)}`);
        const service = new CreateSystemEventStoreEventService(
            new SystemEventRepository(dynamoClient())
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
