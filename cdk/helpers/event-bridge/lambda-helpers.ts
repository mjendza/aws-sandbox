import {CfnRule, EventBus} from '@aws-cdk/aws-events';
import * as lambda from '@aws-cdk/aws-lambda';
import { generateResourceId } from '../../cdk-helper';
import {Duration, Stack} from '@aws-cdk/core';
import { IQueue } from '@aws-cdk/aws-sqs';
import * as iam from '@aws-cdk/aws-iam';
import {ServicePrincipal} from "@aws-cdk/aws-iam";

export function allowLambdaToPushEventsToEventBridge(lambda: lambda.Function, eb: EventBus) {
    eb.grantPutEventsTo(lambda);
}

export function allowEventBridgeRuleToInvokeLambdaHandler(lambda: lambda.Function, rule: CfnRule, ruleId: string,){
    lambda.addPermission(`${generateResourceId(ruleId)}-rule-lambda-call-Permission`, {
        principal: new ServicePrincipal('events.amazonaws.com'),
        sourceArn: rule.attrArn,
    });
}
export function allowToEventBridgeCanPushMessageToDlq(queue: IQueue){
    queue.addToResourcePolicy(
        new iam.PolicyStatement({
            actions: ['sqs:SendMessage'],
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
    queue: IQueue
) {
    const rule = new CfnRule(
        stack,
        generateResourceId(ruleId),
        {
            eventBusName: eb.eventBusName,
            description: generateResourceId(ruleId),
            eventPattern: {
                detailType: [eventName],
            },
            targets: [
                {
                    id: `${generateResourceId(ruleId)}-lambda-target`,
                    arn: lambda.functionArn,
                    deadLetterConfig: {
                        arn: queue.queueArn,
                    },
                    retryPolicy: {
                        maximumEventAgeInSeconds: Duration.minutes(3).toSeconds(),
                        maximumRetryAttempts: 4
                    }
                },
            ],
        }
    );
    allowToEventBridgeCanPushMessageToDlq(queue);
    allowEventBridgeRuleToInvokeLambdaHandler(lambda, rule, ruleId);
    allowLambdaToPushEventsToEventBridge(lambda, eb);
}
