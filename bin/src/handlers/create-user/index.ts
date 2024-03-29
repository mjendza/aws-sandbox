import {
    CreateUserEvent,
    createUserEventSchema,
} from '../../events/user-event';
import { validateEventBridge } from '../../helpers/validation-helpers';
import { EventBridgeEvent } from 'aws-lambda';
import * as log from 'lambda-log';
import { dynamoClient } from '../../helpers/dynamodb-factory';
import { CreateUserService } from '../../users/create-user-service';

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
        const service = new CreateUserService(dynamoClient());
        const result = await service.create(model.detail);
        log.info(`result: ${JSON.stringify(result)}`);
    } catch (error) {
        log.error(`error: ${JSON.stringify(error)}`);
        throw error;
    }
};
