import { SystemEventRepository } from './system-event-repository';
import { SystemEventStoreEvent } from '../events/user-event';

export interface SystemEventEntity {
    id: string;
}

export const systemEventEntitySchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
    },
    required: ['id'],
    additionalProperties: true,
};

export class CreateSystemEventStoreEventService {
    constructor(private repository: SystemEventRepository) {}

    async create(model: SystemEventStoreEvent): Promise<string> {
        const entity: SystemEventEntity = {
            id: model.id,
        };
        await this.repository.put(entity);
        return entity.id;
    }
}
