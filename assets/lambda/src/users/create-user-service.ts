import { UserEntity } from './user-entity';
import { UserRepository } from './user-repository';
import {
    CreateUserApiEvent,
    CreateUserEvent,
    UserCreated,
    UserEvents,
} from '../events/user-event';
import * as uuid from 'uuid';
import { resources } from '../../../../cdk/cdk-resources';
import { SystemEventBridgeRepository } from '../helpers/event-bridge/system-event-bridge-repository';

export class CreateUserService {
    constructor(
        private repository: UserRepository,
        private hub: SystemEventBridgeRepository
    ) {}

    async create(model: CreateUserEvent): Promise<string> {
        const entity: UserEntity = {
            id: uuid.v4(),
            email: model.email,
            createdAt: new Date(Date.now()).toISOString(),
            tags: [],
        };
        await this.repository.put(entity);
        const userCreated = this.createEvent(entity);
        await this.hub.put(
            userCreated,
            `UserCreated`,
            resources.lambdaCreateUser
        );
        return entity.id;
    }
    private createEvent(entity: UserEntity): UserCreated {
        return {
            id: entity.id,
            email: entity.email,
            createdAt: entity.createdAt,
            tags: entity.tags,
        };
    }
}

export class CreateUserApiService {
    constructor(private hub: SystemEventBridgeRepository) {}

    async create(model: CreateUserApiEvent): Promise<string> {
        const entity: CreateUserEvent = {
            id: model.id ?? uuid.v4(),
            email: model.email,
            createdAt: new Date(Date.now()).toISOString(),
            tags: [],
        };
        const createUser = this.createEvent(entity);
        await this.hub.put(
            createUser,
            UserEvents.CreateUser,
            resources.lambdaCreateUser
        );
        return entity.id;
    }
    private createEvent(entity: UserEntity): UserCreated {
        return {
            id: entity.id,
            email: entity.email,
            createdAt: entity.createdAt,
            tags: entity.tags,
        };
    }
}

export class GetUserService {
    constructor(private repository: UserRepository) {}

    get(id: string): Promise<UserEntity> {
        return this.repository.get(id);
    }
}
