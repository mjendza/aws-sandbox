import {CfnRule, EventBus} from "@aws-cdk/aws-events";
import {generateResourceId} from "../../cdk-helper";
import {allowToEventBridgeCfnRuleCanPushMessageToDlq} from "./lambda-helpers";
import {Duration, Stack} from "@aws-cdk/core";
import * as lambda from '@aws-cdk/aws-lambda';
import {IQueue} from "@aws-cdk/aws-sqs";
import {Role} from "@aws-cdk/aws-iam";

export function createEventBridgeRule(stack: Stack, id: string, bus: EventBus, eventName: string, lambda: lambda.Function, queue: IQueue, role: Role): CfnRule{
    const rule = new CfnRule(
        stack,
        generateResourceId(id),
        {
            eventBusName: bus.eventBusName,
            description: generateResourceId(id),
            eventPattern: {
                detailType: [eventName]
            },
            targets: [

                {
                    id: `${generateResourceId(id)}-target`,
                    arn: lambda.functionArn,
                    deadLetterConfig: {
                        arn: queue.queueArn,
                    },
                    retryPolicy: {
                        maximumRetryAttempts: 4,
                        maximumEventAgeInSeconds: Duration.minutes(4).toSeconds()
                    },
                    roleArn: role.roleArn
                },
            ],
        });
    allowToEventBridgeCfnRuleCanPushMessageToDlq(queue, rule, bus);
    return  rule;
}
