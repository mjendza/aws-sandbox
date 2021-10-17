import { EventBridge } from 'aws-sdk';
import { UserLambdaSettings } from '../../../../cdk/settings/lambda-settings';
import { eventBridgeClient } from './event-bridge-client';
import { PutEventsRequest } from 'aws-sdk/clients/eventbridge';
import * as log from 'lambda-log';
import { SystemEventStorePushEvent } from '../../events/system-event-store-push-event';
import { getEnvironmentSettingsKey } from '../get-environment-settings-key';
import { LambdaProxyError } from '../lambda-proxy-error';

export class SystemEventBridgeRepository {
    private eventBridge: EventBridge;
    private eventBusName = getEnvironmentSettingsKey<UserLambdaSettings>(
        'SYSTEM_EVENT_BUS_NAME'
    );

    constructor() {
        this.eventBridge = eventBridgeClient();
    }

    async put(
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
        const result = await this.eventBridge.putEvents(params).promise();
        log.info(`EventBridge result: ${JSON.stringify(result)}`);
        if (!!result.FailedEntryCount && result.FailedEntryCount > 0) {
            log.error(`EventBridge result error: ${JSON.stringify(result)}`);
            throw new LambdaProxyError(500, 'Internal error.');
        }
    }
}
