import { UserEntity } from './userEntity';
import { UserRepository } from './userRepository';
import { UserEvent } from '../events/userEvent';
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
