import { SystemEventStorePushEvent } from '../events/user-event';

export interface SystemEventEntity {
    id: string;
    version: string;
    event: SystemEventStorePushEvent;
    eventType: string;
    sourceSystem: string;
    time: string;
}

export const systemEventEntitySchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
    },
    required: ['id'],
    additionalProperties: true,
};
