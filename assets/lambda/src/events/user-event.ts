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

export const systemSEventStoreEventSchema = {
    type: 'object',
    properties: {},
    required: ['id'],
    additionalProperties: true,
};

export interface SystemEventStoreEvent {
    id: string;
}
