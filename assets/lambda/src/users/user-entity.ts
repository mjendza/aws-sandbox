export interface UserEntity {
    id: string;
    email: string;
}
export const userEntitySchema = {
    type: 'object',
    properties: {
        email: { type: 'string' },
        id: { type: 'string' },
    },
    required: ['email', 'id'],
    additionalProperties: false,
};
