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

export interface UserCreatedEvent extends SystemEventStorePushEvent {
    email: string;
    createdAt: string;
    tags: string[];
    homeRegion: string;
}

export const createUserEventSchema = {
    type: 'object',
    properties: {
        email: { type: 'string' },
        id: { type: 'string' },
    },
    required: ['email', 'id'],
    additionalProperties: true,
};

export interface CreateUserEvent {
    email: string;
    id: string;
    createdAt: string;
    tags: string[];
}

export enum UserEvents {
    CreateUser = 'CreateUser',
    UserCreated = 'UserCreated',
}
