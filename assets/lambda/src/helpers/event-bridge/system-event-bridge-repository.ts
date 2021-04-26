import { EventBridge } from 'aws-sdk';
import { getEnvironmentSettingsKey } from '../validation-helpers';
import { UserLambdaSettings } from '../../../../../cdk/settings/lambda-settings';
import { eventBridgeClient } from './event-bridge-client';
import { PutEventsRequest } from 'aws-sdk/clients/eventbridge';
import * as log from 'lambda-log';

export class SystemEventBridgeRepository {
    private eventBridge: EventBridge;
    private eventBusName = getEnvironmentSettingsKey<UserLambdaSettings>(
        'SYSTEM_EVENT_BUS_NAME'
    );

    constructor() {
        this.eventBridge = eventBridgeClient();
    }

    put(entity: any, type: string, source: string): Promise<any> {
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
