import { CfnRule, EventBus } from '@aws-cdk/aws-events';
import { generateResourceId } from '../cdk-helper';
import * as iam from '@aws-cdk/aws-iam';
import { Stack } from '@aws-cdk/core';
import { IQueue } from '@aws-cdk/aws-sqs';
import * as lambda from '@aws-cdk/aws-lambda';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import {
    maximumEventAgeInSeconds,
    maximumRetryAttempts,
} from '../event-driven-processing/helpers';

export function createCfnRuleWithDlq(
    stack: Stack,
    id: string,
    bus: EventBus,
    eventName: string,
    lambda: lambda.Function,
    queue: IQueue,
    assignPermissionToRuleToInvokeLambda?: boolean
) {
    const rule = new CfnRule(stack, generateResourceId(id), {
        eventBusName: bus.eventBusName,
        description: `Rule matching ${eventName}`,
        eventPattern: {
            'detail-type': [eventName],
        },
        targets: [
            {
                id: `${generateResourceId(id)}-target`,
                arn: lambda.functionArn,
                deadLetterConfig: {
                    arn: queue.queueArn,
                },
                retryPolicy: {
                    maximumRetryAttempts: maximumRetryAttempts,
                    maximumEventAgeInSeconds: maximumEventAgeInSeconds,
                },
            },
        ],
    });
    queue.addToResourcePolicy(
        new iam.PolicyStatement({
            actions: ['sqs:SendMessage'],
            resources: [queue.queueArn],
            principals: [new iam.ServicePrincipal('events.amazonaws.com')],
            conditions: {
                ArnEquals: { 'aws:SourceArn': rule.attrArn },
            },
        })
    );

    if (
        assignPermissionToRuleToInvokeLambda ||
        assignPermissionToRuleToInvokeLambda === undefined
    ) {
        lambda.addPermission(`${generateResourceId(id)}-invoke-lambda`, {
            principal: new ServicePrincipal('events.amazonaws.com'),
            sourceArn: rule.attrArn,
        });
    }
}
