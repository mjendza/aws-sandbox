import { EventBridge } from 'aws-sdk';
import { UserLambdaSettings } from '../../../../../cdk/settings/lambda-settings';
import { eventBridgeClient } from './event-bridge-client';
import { PutEventsRequest } from 'aws-sdk/clients/eventbridge';
import * as log from 'lambda-log';
import { SystemEventStorePushEvent } from '../../events/system-event-store-push-event';
import { getEnvironmentSettingsKey } from '../get-environment-settings-key';

export class SystemEventBridgeRepository {
    private eventBridge: EventBridge;
    private eventBusName = getEnvironmentSettingsKey<UserLambdaSettings>(
        'SYSTEM_EVENT_BUS_NAME'
    );

    constructor() {
        this.eventBridge = eventBridgeClient();
    }

    put(
        entity: SystemEventStorePushEvent,
        type: string,
        source: string
    ): Promise<any> {
        const params: PutEventsRequest = {
            Entries: [
                {
                    Detail: JSON.stringify(entity),
                    DetailType: type,
                    Source: source,
                    EventBusName: this.eventBusName,
                },
            ],
        };
        log.info(`EventBridge params: ${JSON.stringify(params)}`);
        return this.eventBridge.putEvents(params).promise();
    }
}
