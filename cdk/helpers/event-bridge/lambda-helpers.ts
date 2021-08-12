import { EventBus } from '@aws-cdk/aws-events';
import * as lambda from '@aws-cdk/aws-lambda';
import { Stack } from '@aws-cdk/core';
import { IQueue } from '@aws-cdk/aws-sqs';
import { createCfnRuleWithDlq } from './rule-helper';

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
    createCfnRuleWithDlq(
        stack,
        ruleId,
        eb,
        eventName,
        lambda,
        queue,
        assignPermissions
    );
    useEventBridge(lambda, eb);
}
