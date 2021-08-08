import { CfnRule, EventBus, Rule } from '@aws-cdk/aws-events';
import * as lambda from '@aws-cdk/aws-lambda';
import { Stack } from '@aws-cdk/core';
import { IQueue } from '@aws-cdk/aws-sqs';
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal} from '@aws-cdk/aws-iam';
import {createEventBridgeRule} from "./helpers";
import {generateResourceId} from "../../cdk-helper";

export function allowLambdaToPushEventsToEventBridge(
    lambda: lambda.Function,
    eb: EventBus
) {
    eb.grantPutEventsTo(lambda);
}

export function allowEventBridgeToInvokeLambda(
    lambda: lambda.Function,
    eb: EventBus
) {
    //lambda.grantInvoke(new ArnPrincipal(rule.attrArn));
    lambda.grantInvoke(new ServicePrincipal('events.amazonaws.com'));
}

export function allowCfnRuleToInvokeLambda(stack:Stack,
    lambda: lambda.Function,
    eb: EventBus,
                                           id: string
): Role {
    return new Role(stack, `${generateResourceId(id)}-RuleRole`, {
        assumedBy: new ServicePrincipal('events.amazonaws.com'),
        inlinePolicies: {
            LambdaInvoke: new PolicyDocument({
                statements: [
                    new PolicyStatement({
                        actions: [
                            'lambda:InvokeFunction',
                        ],
                        effect: Effect.ALLOW,
                        resources: [lambda.functionArn],
                    }),
                ],
            }),
        },
    });
    //lambda.grantInvoke(new ArnPrincipal(rule.attrArn));
    //lambda.grantInvoke(new ServicePrincipal('events.amazonaws.com'));
}

export function allowRuleToInvokeLambdaHandler(
    lambda: lambda.Function,
    rule: Rule,
    ruleId: string
) {
    lambda.grantInvoke(new ServicePrincipal('events.amazonaws.com'));
}

export function allowToEventBridgeCfnRuleCanPushMessageToDlq(
    queue: IQueue,
    rule: CfnRule,
    bus: EventBus
) {
    const qPolicy = new PolicyStatement();
    qPolicy.effect = Effect.ALLOW;
    qPolicy.addServicePrincipal('events.amazonaws.com');
    qPolicy.addActions("sqs:SendMessage", "sqs:GetQueueAttributes", "sqs:GetQueueUrl");
    qPolicy.addResources(queue.queueArn);

    qPolicy.addCondition("ArnEquals", {
        "aws:SourceArn": rule.attrArn
    });
    queue.addToResourcePolicy(qPolicy);
    //queue.grantSendMessages(new ServicePrincipal('events.amazonaws.com'));
    // queue.grantSendMessages(new ArnPrincipal(bus.eventBusArn));
    //queue.grantSendMessages(new ArnPrincipal(rule.attrArn));
}

export function allowToEventBridgeCanPushMessageToDlq(
    queue: IQueue,
    rule: Rule,
    bus: EventBus
) {
    const qPolicy = new PolicyStatement();
    qPolicy.effect = Effect.ALLOW;
    qPolicy.addServicePrincipal('events.amazonaws.com');
    qPolicy.addActions("sqs:SendMessage", "sqs:GetQueueAttributes", "sqs:GetQueueUrl");
    qPolicy.addResources(queue.queueArn);

    qPolicy.addCondition("ArnEquals", {
        "aws:SourceArn": rule.ruleArn
    });
    queue.addToResourcePolicy(qPolicy);
    //queue.grantSendMessages(new ServicePrincipal('events.amazonaws.com'));
    // queue.grantSendMessages(new ArnPrincipal(bus.eventBusArn));
    // queue.grantSendMessages(new ArnPrincipal(rule.ruleArn));
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
    // const rule = new Rule(stack, generateResourceId(ruleId), {
    //     eventBus: eb,
    //     eventPattern: {
    //         detailType: [eventName],
    //     },
    // });
    //
    // rule.addTarget(
    //     new LambdaFunctionTarget(lambda, {
    //         deadLetterQueue: queue, // Optional: add a dead letter queue
    //         maxEventAge: Duration.minutes(3), // Optional: set the maxEventAge retry policy
    //         retryAttempts: 4, // Optional: set the max number of retry attempts
    //     })
    // );
    const role = allowCfnRuleToInvokeLambda(stack, lambda, eb, ruleId);
    const rule = createEventBridgeRule(stack, ruleId, eb, eventName, lambda, queue, role);
    allowLambdaToPushEventsToEventBridge(lambda, eb);


    if (assignPermissions === undefined || assignPermissions == true) {
    }
    allowToEventBridgeCfnRuleCanPushMessageToDlq(queue, rule, eb);

}
