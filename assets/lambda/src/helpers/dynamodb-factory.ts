import * as AwsXRay from 'aws-xray-sdk';
import { DynamoDB, EventBridge } from 'aws-sdk';
import { LambdaProxyError } from './lambda-proxy-error';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as log from 'lambda-log';
import { PutEventsRequest } from 'aws-sdk/clients/eventbridge';
import { getEnvironmentSettingsKey } from './validation-helpers';
import { UserLambdaSettings } from '../../../../cdk/settings/lambda-settings';

export function dynamoClient(region?: string): DynamoDB.DocumentClient {
    const fromEnv = process.env['AWS_REGION'];
    if (!fromEnv) {
        throw new LambdaProxyError(500, "AWS_REGION can't be empty");
    }
    const awsRegion = region || fromEnv;
    const options: DocumentClient.DocumentClientOptions &
        DynamoDB.Types.ClientConfiguration = {
        service: new DynamoDB(),
        region: awsRegion,
    };
    log.info(`dynamoClient options: ${JSON.stringify(options)}`);
    const client = new DynamoDB.DocumentClient(options);
    //https://github.com/aws/aws-xray-sdk-node/issues/23
    AwsXRay.captureAWSClient((client as any).service);
    return client;
}

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

export function eventBridgeClient(region?: string) {
    const fromEnv = process.env['AWS_REGION'];
    if (!fromEnv) {
        throw new LambdaProxyError(500, "AWS_REGION can't be empty");
    }
    const awsRegion = region || fromEnv;
    return new EventBridge({ region: awsRegion });
}
