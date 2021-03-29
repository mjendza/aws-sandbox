import { UserEvent, userEventSchema } from './events/userEvent';
import { validate } from './helpers/validationHelpers';
import { UserRepository } from './users/userRepository';
import { UserEntity } from './users/userEntity';

const uuidv4 = require('uuid/v4');

export const handler = async (event: any = {}): Promise<any> => {
    const item =
        typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    if (!event.body) {
        return {
            statusCode: 400,
            body: 'invalid request, you are missing the parameter body',
        };
    }
    const [model, error] = validate<UserEvent>(item, userEventSchema);
    if (error) {
        return {
            statusCode: 400,
            body: error,
        };
    }
    const entity: UserEntity = {
        email: model.email,
        id: uuidv4(),
    };

    const repository = new UserRepository();
    await repository.put(entity);
};
