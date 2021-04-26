import { UserEntity } from './user-entity';
import { UserRepository } from './user-repository';
import { UserEvent } from '../events/user-event';
import * as uuid from 'uuid';
import { resources } from '../../../../cdk/cdk-resources';
import { SystemEventBridgeRepository } from '../helpers/dynamodb-factory';

export class CreateUserService {
    constructor(
        private repository: UserRepository,
        private hub: SystemEventBridgeRepository
    ) {}

    async create(model: UserEvent): Promise<string> {
        const entity: UserEntity = {
            id: uuid.v4(),
            email: model.email,
            createdAt: new Date(Date.now()).toISOString(),
            tags: [],
        };
        await this.repository.put(entity);
        await this.hub.put(entity, `UserCreated`, resources.lambdaCreateUser);
        return entity.id;
    }
}

export class GetUserService {
    constructor(private repository: UserRepository) {}

    get(id: string): Promise<UserEntity> {
        return this.repository.get(id);
    }
}
