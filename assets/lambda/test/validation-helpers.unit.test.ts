import { validate } from '../src/helpers/validation-helpers';
import { UserEvent, userEventSchema } from '../src/events/userEvent';

test('validate UserEvent with validation-helper should return generic object', () => {
    //GIVEN
    const event = {
        body: JSON.stringify({
            email: 'abc',
        }),
    } as any;

    // WHEN
    const result = validate<UserEvent>(event, userEventSchema);

    // THEN
    expect(result).not.toBeUndefined();
});
