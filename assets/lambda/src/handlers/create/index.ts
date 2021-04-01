import { UserEvent, userEventSchema } from '../../events/userEvent';
import { validate } from '../../helpers/validationHelpers';
import { CreateUserService } from '../../users/createUserService';

export const handler = async (event: any = {}): Promise<any> => {
    try {
        const item =
            typeof event.body == 'object' ? event.body : JSON.parse(event.body);
        if (!event.body) {
            return {
                statusCode: 400,
                body: 'invalid request, you are missing the parameter body',
            };
        }
        const model = validate<UserEvent>(item, userEventSchema);
        const service = new CreateUserService();
        const result = await service.create(model);
        return {
            statusCode: 201,
            body: {
                id: result,
            },
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: error,
        };
    }
};
