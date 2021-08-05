import { EventBus, Rule } from '@aws-cdk/aws-events';
import * as lambda from '@aws-cdk/aws-lambda';
import { generateResourceId } from '../../cdk-helper';
import { LambdaFunction as LambdaFunctionTarget } from '@aws-cdk/aws-events-targets/lib/lambda';
import { Duration, Stack } from '@aws-cdk/core';
import { IQueue } from '@aws-cdk/aws-sqs';
import * as iam from '@aws-cdk/aws-iam';

export function useEventBridge(lambda: lambda.Function, eb: EventBus) {
    eb.grantPutEventsTo(lambda);
}

export function useEventBridgeLambdaHandler(
    stack: Stack,
    eventName: string,
    lambda: lambda.Function,
    eb: EventBus,
    ruleId: string,
    queue: IQueue,
    assignPermissions?: boolean
) {
    const rule = new Rule(stack, generateResourceId(ruleId), {
        eventBus: eb,
        eventPattern: {
            detailType: [eventName],
        },
    });

    rule.addTarget(
        new LambdaFunctionTarget(lambda, {
            deadLetterQueue: queue, // Optional: add a dead letter queue
            maxEventAge: Duration.minutes(3), // Optional: set the maxEventAge retry policy
            retryAttempts: 4, // Optional: set the max number of retry attempts
        })
    );
    queue.addToResourcePolicy(
        new iam.PolicyStatement({
            actions: ['sqs:SendMessage'],
            resources: [queue.queueArn],
            principals: [new iam.ServicePrincipal('events.amazonaws.com')],
            conditions: {
                ArnEquals: { 'aws:SourceArn': rule.ruleArn },
            },
        })
    );
    useEventBridge(lambda, eb);
    // if (assignPermissions || assignPermissions === undefined) {
    //     useEventBridge(lambda, eb);
    // }
}
