import {
    CreateUserEvent,
    createUserEventSchema,
} from '../../events/user-event';
import { validateEventBridge } from '../../helpers/validation-helpers';
import { EventBridgeEvent } from 'aws-lambda';
import * as log from 'lambda-log';
import { dynamoClient } from '../../helpers/dynamodb-factory';
import { CreateUserService } from '../../users/create-user-service';
import { UserRepository } from '../../users/user-repository';
import { SystemEventBridgeRepository } from '../../helpers/event-bridge/system-event-bridge-repository';

export const handler = async (
    event: EventBridgeEvent<string, any>
): Promise<void> => {
    try {
        log.info(`event: ${JSON.stringify(event)}`);
        const model = validateEventBridge<CreateUserEvent>(
            event,
            createUserEventSchema
        );
        log.info(`model: ${JSON.stringify(model)}`);
        const service = new CreateUserService(
            new UserRepository(dynamoClient()),
            new SystemEventBridgeRepository()
        );
        const result = await service.create(model.detail);
        log.info(`result: ${JSON.stringify(result)}`);
    } catch (error) {
        log.error(`error: ${JSON.stringify(error)}`);
        throw error;
    }
};
