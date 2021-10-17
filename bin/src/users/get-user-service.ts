import { UserRepository } from './user-repository';
import { UserEntity } from './user-entity';

export class GetUserService {
    constructor(private repository: UserRepository) {}

    get(id: string): Promise<UserEntity> {
        return this.repository.get(id);
    }
}
