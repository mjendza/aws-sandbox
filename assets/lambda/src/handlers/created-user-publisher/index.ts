import * as log from 'lambda-log';
import { SystemEventBridgeRepository } from '../../helpers/event-bridge/system-event-bridge-repository';
import { UserCreated, UserEvents } from '../../events/user-event';

export const handler = async (event: any): Promise<any> => {
    try {
        log.info(`event: ${JSON.stringify(event)}`);

        const systemBus = new SystemEventBridgeRepository();
        return Promise.all(
            event.Records.map((record: any) => {
                if (record.eventName == 'INSERT') {
                    log.info(`event is INSERT`);
                    const userCreated: UserCreated = {
                        id: record.dynamodb.Keys.id.S,
                        createdAt: record.dynamodb.NewImage.createdAt.S,
                        email: record.dynamodb.NewImage.email.S,
                        tags: record.dynamodb.NewImage.email.L,
                        homeRegion: record.dynamodb.NewImage.homeRegion.S,
                    };
                    systemBus.put(
                        userCreated,
                        UserEvents.UserCreated,
                        'DynamoDB-Event-Stream'
                    );
                }
            })
        );
    } catch (error) {
        log.error(`error: ${JSON.stringify(error)}`);
        throw error;
    }
};
