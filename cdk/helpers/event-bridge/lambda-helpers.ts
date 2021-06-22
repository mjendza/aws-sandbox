import { EventBus, Rule } from '@aws-cdk/aws-events';
import * as lambda from '@aws-cdk/aws-lambda';
import { generateResourceId } from '../../cdk-helper';
import { LambdaFunction as LambdaFunctionTarget } from '@aws-cdk/aws-events-targets/lib/lambda';
import { Duration, Stack } from '@aws-cdk/core';

export function useEventBridge(lambda: lambda.Function, eb: EventBus) {
    eb.grantPutEventsTo(lambda);
}

export function useEventBridgeLambdaHandler(
    stack: Stack,
    eventName: string,
    lambda: lambda.Function,
    eb: EventBus,
    ruleId: string
) {
    const rule = new Rule(stack, generateResourceId(ruleId), {
        eventBus: eb,
        eventPattern: {
            detailType: [eventName],
        },
    });
    //const queue = new sqs.Queue(this, 'Queue');
    rule.addTarget(
        new LambdaFunctionTarget(lambda, {
            // deadLetterQueue: queue, // Optional: add a dead letter queue
            maxEventAge: Duration.hours(2), // Optional: set the maxEventAge retry policy
            retryAttempts: 4, // Optional: set the max number of retry attempts
        })
    );
}
