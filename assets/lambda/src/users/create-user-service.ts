import { UserEntity } from './user-entity';
import { UserRepository } from './user-repository';
import { UserEvent } from '../events/user-event';
import * as uuid from 'uuid';

export class CreateUserService {
    private repository: UserRepository;

    constructor() {
        this.repository = new UserRepository();
    }

    async create(model: UserEvent): Promise<string> {
        const entity: UserEntity = {
            email: model.email,
            id: uuid.v4(),
        };
        await this.repository.put(entity);
        return entity.id;
    }
}

export class GetUserService {
    private repository: UserRepository;

    constructor() {
        this.repository = new UserRepository();
    }

    get(id: string): Promise<UserEntity> {
        return this.repository.get(id);
    }
}
