import { SystemEventStoreRepository } from './system-event-push-repository';
import { SystemEventEntity } from './system-event-entity';
import { EventBridgeEvent } from 'aws-lambda';
import { SystemEventStorePushEvent } from '../events/system-event-store-push-event';

export class StoreSystemEventService {
    constructor(private repository: SystemEventStoreRepository) {}

    async create(
        model: EventBridgeEvent<string, SystemEventStorePushEvent>
    ): Promise<string> {
        const entity: SystemEventEntity = {
            id: `${model['detail-type']}${DYNAMO_DB_PIPE}${model.id}`,
            event: model.detail,
            eventType: model['detail-type'],
            version: model.version,
            time: model.time,
            sourceSystem: model.source,
        };
        await this.repository.put(entity);
        return entity.id;
    }
}
export const DYNAMO_DB_PIPE: string = '|';
