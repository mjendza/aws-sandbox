process.argv.push('--profile=default');
process.argv.push('--stack=dev-aws-sandbox');
process.argv.push('--region=eu-central-1');

// @ts-ignore
import * as TestTools from 'sls-test-tools';
// @ts-ignore
import { toHaveEvent } from 'sls-test-tools';
import { ConfigurationManager } from '../assets/lambda/src/helpers/ssm/helper';
import { generateResourceId, ssmParameterBuilder } from '../cdk/cdk-helper';
import { resources } from '../cdk/cdk-resources';

declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveEventWithSource(data: string): CustomMatcherResult;
        }
    }
}
jest.setTimeout(50000);

describe('Integration Testing Event Bridge', () => {
    const lambda = new TestTools.AWSClient.Lambda();
    let eventBridge: TestTools.EventBridge;
    const configM = new ConfigurationManager();
    let functionName: string;
    beforeAll(async () => {
        const busId = generateResourceId(resources.systemEventBridge);
        const busName = await configM.getKey([ssmParameterBuilder(busId)]);
        eventBridge = await TestTools.EventBridge.build(busName);
        functionName = await configM.getKey([
            ssmParameterBuilder(generateResourceId(resources.lambdaCreateUser)),
        ]);
    });

    afterAll(async () => {
        await eventBridge.destroy();
    });

    it('correctly publishes an event to the event bus when the lambda is invoked', async () => {
        const event = {
            body: JSON.stringify({
                email: 'abc',
            }),
        };
        // Invoke Lambda Function
        const params = {
            FunctionName: functionName,
            Payload: JSON.stringify(event),
        };
        await lambda.invoke(params).promise();

        const eventBridgeEvents = await eventBridge.getEvents();
        //expect(eventBridgeEvents).toHaveEvent();
        expect(eventBridgeEvents).toHaveEventWithSource(
            resources.lambdaCreateUser
        );
    });

    it('should not publish an event to the event bus when the lambda is invoked', async () => {
        const event = {
            body: JSON.stringify({
                email: 'abc',
            }),
        };
        const params = {
            FunctionName: functionName,
            Payload: JSON.stringify(event),
        };
        await lambda.invoke(params).promise();

        const eventBridgeEvents = await eventBridge.getEvents();
        expect(eventBridgeEvents).not.toHaveEventWithSource('fake-event');
    });
});
