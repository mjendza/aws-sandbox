import { EventBus, Rule } from '@aws-cdk/aws-events';
import * as lambda from '@aws-cdk/aws-lambda';
import { generateResourceId } from '../../cdk-helper';
import { Duration, Stack } from '@aws-cdk/core';
import { IQueue } from '@aws-cdk/aws-sqs';
import * as iam from '@aws-cdk/aws-iam';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LambdaFunction as LambdaFunctionTarget } from '@aws-cdk/aws-events-targets';

export function allowLambdaToPushEventsToEventBridge(
    lambda: lambda.Function,
    eb: EventBus
) {
    eb.grantPutEventsTo(lambda);
}

export function allowEventBridgeRuleToInvokeLambdaHandler(
    lambda: lambda.Function,
    rule: Rule,
    ruleId: string
) {
    lambda.addPermission(
        `${generateResourceId(ruleId)}-rule-lambda-call-Permission`,
        {
            principal: new ServicePrincipal('events.amazonaws.com'),
            sourceArn: rule.ruleArn,
        }
    );
}
export function allowToEventBridgeCanPushMessageToDlq(queue: IQueue) {
    queue.addToResourcePolicy(
        new iam.PolicyStatement({
            actions: ['sqs:SendMessage', 'sqs:SendMessageBatch', 'sqs:ChangeMessageVisibilityBatch'],
            resources: [queue.queueArn],
            principals: [new iam.ServicePrincipal('events.amazonaws.com')],
        })
    );
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
    if(assignPermissions===undefined || assignPermissions == true){
        allowEventBridgeRuleToInvokeLambdaHandler(lambda, rule, ruleId);
    }
    allowToEventBridgeCanPushMessageToDlq(queue);
    allowLambdaToPushEventsToEventBridge(lambda, eb);
}
