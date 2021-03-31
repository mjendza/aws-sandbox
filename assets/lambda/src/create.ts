import { UserEvent, userEventSchema } from './events/userEvent';
import { validate } from './helpers/validationHelpers';

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
};
