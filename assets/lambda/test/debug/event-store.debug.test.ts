import * as AwsXRay from 'aws-xray-sdk';
import { handler } from '../../src/handlers/event-store';
import { EventBridgeEvent } from 'aws-lambda';
import {UserCreated} from "../../../../cdk/user-created";
AwsXRay.setContextMissingStrategy('LOG_ERROR');
test('DEBUG create user', async () => {
    //GIVEN
    const event: EventBridgeEvent<string, UserCreated> = {
        id: 'fake',
        detail: {
            id: 'fakeEntityId',
            createdAt: 'aaa',
            email: 'aaa@a.com',
        },
        'detail-type': 'UserCreated',
        source: 'lambda',
        resources: [],
        account: 'a',
        region: 'eu-central-1',
        time: 'a',
        version: '2',
    };
    process.env.SYSTEM_TABLE_NAME =
        'dev-aws-sandbox-devsystemeventstore0CA54587-ZD66UDZ1GXK3';
    process.env.AWS_REGION = 'eu-central-1';
    // WHEN
    await handler(event);

    // THEN
    // check DynamoDB record
});
