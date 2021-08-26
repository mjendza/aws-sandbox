import { CfnRule, EventBus } from '@aws-cdk/aws-events';
import { generateResourceId } from '../../cdk-helper';
import * as iam from '@aws-cdk/aws-iam';
import { Duration, Stack } from '@aws-cdk/core';
import { IQueue } from '@aws-cdk/aws-sqs';
import * as lambda from '@aws-cdk/aws-lambda';
import { ServicePrincipal } from '@aws-cdk/aws-iam';

export function createCfnRuleWithDlq(
    stack: Stack,
    id: string,
    bus: EventBus,
    eventName: string,
    lambda: lambda.Function,
    queue: IQueue,
    assignPermission?: boolean
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
                    maximumRetryAttempts: 4,
                    maximumEventAgeInSeconds: Duration.minutes(4).toSeconds(),
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

    if (assignPermission || assignPermission === undefined) {
        lambda.addPermission(`${generateResourceId(id)}-invoke-lambda`, {
            principal: new ServicePrincipal('events.amazonaws.com'),
            sourceArn: rule.attrArn,
        });
    }
}
