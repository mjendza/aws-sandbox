import { UserEntity } from './user-entity';
import { UserRepository } from './user-repository';
import { CreateUserEvent, UserCreatedEvent } from '../events/user-event';
import { resources } from '../../../../cdk/cdk-resources';
import { SystemEventBridgeRepository } from '../helpers/event-bridge/system-event-bridge-repository';

export class CreateUserService {
    constructor(
        private repository: UserRepository,
        private hub: SystemEventBridgeRepository
    ) {}

    async create(model: CreateUserEvent): Promise<string> {
        const entity: UserEntity = {
            id: model.id,
            email: model.email,
            createdAt: new Date(Date.now()).toISOString(),
            tags: [],
            homeRegion: `eu-central-1`,
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
    private createEvent(entity: UserEntity): UserCreatedEvent {
        return {
            id: entity.id,
            email: entity.email,
            createdAt: entity.createdAt,
            tags: entity.tags,
            homeRegion: 'eu-central-1',
        };
    }
}
