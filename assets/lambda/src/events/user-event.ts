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

export const systemEventBridgeEventSchema = {
    type: 'object',
    properties: {},
    required: ['id'],
    additionalProperties: true,
};

export interface SystemEventStorePushEvent {
    id: string;
}

export interface UserCreated extends SystemEventStorePushEvent {
    email: string;
    createdAt: string;
    tags: string[];
}

export interface SystemEventBridgeEvent {
    id: string;
    version: number;
    detail: any;
    'detail-type': string;
    source: string;
    time: string;
}
