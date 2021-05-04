import {
    SystemEventBridgeEvent,
    systemEventBridgeEventSchema,
} from '../../events/user-event';
import { validateEventBridge } from '../../helpers/validation-helpers';
import { EventBridgeEvent } from 'aws-lambda';
import * as log from 'lambda-log';
import { dynamoClient } from '../../helpers/dynamodb-factory';
import { StoreSystemEventService } from '../../event-store/create-system-event-store-event-service';
import { SystemEventStoreRepository } from '../../event-store/system-event-push-repository';

export const handler = async (
    event: EventBridgeEvent<string, any>
): Promise<void> => {
    try {
        log.info(`event: ${JSON.stringify(event)}`);
        const model = validateEventBridge<SystemEventBridgeEvent>(
            event,
            systemEventBridgeEventSchema
        );
        log.info(`model: ${JSON.stringify(model)}`);
        const service = new StoreSystemEventService(
            new SystemEventStoreRepository(dynamoClient())
        );
        const result = await service.create(model);
        log.info(`result: ${JSON.stringify(result)}`);
    } catch (error) {
        log.error(`error: ${JSON.stringify(error)}`);
        throw error;
    }
};
