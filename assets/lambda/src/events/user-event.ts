export const userEventSchema = {
    type: 'object',
    properties: {
        email: { type: 'string' },
    },
    required: ['email'],
    additionalProperties: false,
};

export interface UserEvent {
    email: string;
    id?: string;
}
