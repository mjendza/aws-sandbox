import { SystemEventStorePushEvent } from './system-event-store-push-event';

export const userEventSchema = {
    type: 'object',
    properties: {
        email: { type: 'string' },
    },
    required: ['email'],
    additionalProperties: false,
};

export interface CreateUserApiEvent {
    email: string;
    id?: string;
}

export interface UserCreated extends SystemEventStorePushEvent {
    email: string;
    createdAt: string;
    tags: string[];
}

export const createUserEventSchema = {
    type: 'object',
    properties: {
        email: { type: 'string' },
        id: { type: 'string' },
    },
    required: ['email', 'id'],
    additionalProperties: false,
};

export interface CreateUserEvent {
    email: string;
    id: string;
    createdAt: string;
    tags: string[];
}
