// @ts-ignore
import * as TestTools from "sls-test-tools";



describe("Integration Testing Event Bridge", () => {
    // const lambda = new TestTools.AWSClient.Lambda()
    let eventBridge: TestTools.EventBridge;
    // const s3 = new TestTools.AWSClient.S3()

    beforeAll(async () => {
        eventBridge = await TestTools.EventBridge.build("event-bridge")
    });

    afterAll(async () => {
        await eventBridge.destroy()
    });

    it("correctly publishes an event to the event bus when the lambda is invoked", async () => {
        // const event = {
        //     body: JSON.stringify({
        //         filename: filename,
        //     }),
        // };

        // // Invoke Lambda Function
        // const params = {
        //     FunctionName: "event-bridge-example-dev-service1",
        //     Payload: JSON.stringify(event),
        // };
        // await lambda.invoke(params).promise();
        //
        // const eventBridgeEvents = await eventBridge.getEvents()
        // expect(eventBridgeEvents).toHaveEvent();
        // expect(eventBridgeEvents).toHaveEventWithSource("order.created");
    });

});

