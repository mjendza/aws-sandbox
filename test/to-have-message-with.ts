import CustomMatcherResult = jest.CustomMatcherResult;
expect.extend({
    toHaveMessageWith(
        eventBridgeEvents: any,
        message: any
    ): CustomMatcherResult {
        const events = eventBridgeEvents.Messages.map((x: { Body: any }) =>
            JSON.parse(x.Body)
        );
        const messages = events.map((x: { detail: any }) => x.detail);
        const pass = this.equals(
            messages,
            expect.arrayContaining([expect.objectContaining(message)])
        );

        if (pass) {
            return {
                message: () =>
                    `expected ${this.utils.printReceived(
                        events
                    )} not to contain object ${this.utils.printExpected(
                        message
                    )}`,
                pass: true,
            };
        } else {
            return {
                message: () =>
                    `expected ${this.utils.printReceived(
                        events
                    )} to contain object ${this.utils.printExpected(message)}`,
                pass: false,
            };
        }
    },
});

export {};

declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveEventWithSource(data: string): CustomMatcherResult;
            toHaveMessageWith(data: any): CustomMatcherResult;
        }
    }
}
