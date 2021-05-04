import { SystemEventStoreRepository } from './system-event-push-repository';
import {
    SystemEventBridgeEvent,
    SystemEventStorePushEvent,
} from '../events/user-event';
import { SystemEventEntity } from './system-event-entity';

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
