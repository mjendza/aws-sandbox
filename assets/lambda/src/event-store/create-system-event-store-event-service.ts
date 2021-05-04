import { SystemEventStoreRepository } from './system-event-push-repository';
import {SystemEventBridgeEvent, SystemEventStorePushEvent} from "../events/user-event";

export interface SystemEventEntity {
    id: string;
    version: number;
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

export class StoreSystemEventService {
    constructor(private repository: SystemEventStoreRepository) {}

    async create(model: SystemEventBridgeEvent): Promise<string> {
        const entity: SystemEventEntity = {
            id: `${model['detail-type']}${model.id}`,
            event: model.detail as SystemEventStorePushEvent,
            eventType: model['detail-type'],
            version: model.version,
            time: model.time,
            sourceSystem: model.source,
        };
        await this.repository.put(entity);
        return entity.id;
    }
}
