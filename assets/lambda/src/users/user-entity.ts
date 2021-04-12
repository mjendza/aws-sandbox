export interface UserEntity {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
}
export const userEntitySchema = {
    type: 'object',
    properties: {
        email: { type: 'string' },
        id: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        tags: { type: 'array' },
    },
    required: ['email', 'id', 'createdAt', 'tags'],
    additionalProperties: false,
};
