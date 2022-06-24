import { SystemEventBridgeRepository } from '../helpers/event-bridge/system-event-bridge-repository';
import {
    CreateUserApiEvent,
    CreateUserEvent,
    UserCreatedEvent,
    UserEvents,
} from '../events/user-event';
import * as uuid from 'uuid';
import { resources } from '../../../cdk/resources/cdk-resources';

export class CreateUserApiService {
    constructor(private hub: SystemEventBridgeRepository) {}

    async create(model: CreateUserApiEvent): Promise<string> {
        const event: CreateUserEvent = {
            id: model.id ?? uuid.v4(),
            email: model.email,
            createdAt: new Date(Date.now()).toISOString(),
            tags: [],
        };
        const createUser = this.createEvent(event);
        await this.hub.put(
            createUser,
            UserEvents.CreateUser,
            resources.lambdaCreateUser
        );
        return event.id;
    }

    private createEvent(entity: CreateUserEvent): UserCreatedEvent {
        return {
            id: entity.id,
            email: entity.email,
            createdAt: entity.createdAt,
            tags: entity.tags,
            homeRegion: 'eu-central-1',
        };
    }
}
