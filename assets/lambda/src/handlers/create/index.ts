import { CreateUserApiEvent, userEventSchema } from '../../events/user-event';
import { validate } from '../../helpers/validation-helpers';
import {
    proxyIntegrationError,
    proxyIntegrationResult,
} from '../../helpers/proxy-integration';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as log from 'lambda-log';
import { SystemEventBridgeRepository } from '../../helpers/event-bridge/system-event-bridge-repository';
import { CreateUserApiService } from '../../users/create-user-api-service';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        log.info(`START USER-CREATE`);
        log.info(`event: ${JSON.stringify(event)}`);
        const model = validate<CreateUserApiEvent>(event, userEventSchema);
        log.info(`model: ${JSON.stringify(model)}`);
        const service = new CreateUserApiService(
            new SystemEventBridgeRepository()
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
