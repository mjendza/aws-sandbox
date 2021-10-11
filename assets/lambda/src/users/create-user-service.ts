import { UserEntity } from './user-entity';
import { UserRepository } from './user-repository';
import { CreateUserEvent } from '../events/user-event';

export class CreateUserService {
    constructor(private repository: UserRepository) {}

    async create(model: CreateUserEvent): Promise<string> {
        const entity: UserEntity = {
            id: model.id,
            email: model.email,
            createdAt: new Date(Date.now()).toISOString(),
            tags: [],
            homeRegion: `eu-central-1`,
        };
        await this.repository.put(entity);
        return entity.id;
    }
}
