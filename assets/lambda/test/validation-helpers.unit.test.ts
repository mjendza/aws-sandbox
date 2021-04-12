import { validate, validateEntity } from '../src/helpers/validation-helpers';
import { UserEvent, userEventSchema } from '../src/events/user-event';
import { UserEntity, userEntitySchema } from '../src/users/user-entity';

test('validate UserEvent with validation-helper should return generic object', () => {
    //GIVEN
    const event = {
        body: JSON.stringify({
            email: 'abc@abc.com',
        }),
    } as any;

    // WHEN
    const result = validate<UserEvent>(event, userEventSchema);

    // THEN
    expect(result).not.toBeUndefined();
});

test('validate UserEntity with validation-helper should return generic object', () => {
    //GIVEN
    const entity = {
        id: 'test-id',
        email: 'abc@abc.com',
        createdAt: '2',
        updatedAt: '3',
        tags: [],
    };

    // WHEN
    const result = validateEntity<UserEntity>(entity, userEntitySchema);

    // THEN
    expect(result).not.toBeUndefined();
});

[
    {
        email: 'abc@abc.com',
        createdAt: '2',
        updatedAt: '3',
        tags: [],
    },
    {
        id: 'test-id',
        createdAt: '2',
        updatedAt: '3',
        tags: [],
    },
    {
        id: 'test-id',
        email: 'abc@abc.com',
        updatedAt: '3',
        tags: [],
    },
    {
        id: 'test-id',
        email: 'abc@abc.com',
        createdAt: '2',
        updatedAt: '3',
    },
].forEach(function (entity) {
    test('validate UserEntity with validation-helper should throw  generic object', () => {
        expect(() =>
            validateEntity<UserEntity>(entity, userEntitySchema)
        ).toThrow('must have required property');
    });
});
