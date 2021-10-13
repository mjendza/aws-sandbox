import { generateResourceId, lambdaFactory } from '../cdk-helper';
import { resources } from '../cdk-resources';
import { Stack } from '@aws-cdk/core';
import { useEventBridgeLambdaHandler } from '../helpers/event-bridge/lambda-helpers';
import { UserEvents } from '../../bin/src/events/user-event';
import { EventBus } from '@aws-cdk/aws-events';
import { IQueue } from '@aws-cdk/aws-sqs';

export function paymentFlowErrorLambda(
    stack: Stack,
    lambdaSourceCode: string,
    bus: EventBus,
    userDlq: IQueue,
    asyncLambdaDlq: IQueue
) {
    const settings: PaymentFlowHandlerLambdaSettings = {
        flowType: PaymentFlow.error,
    };
    const lambda = lambdaFactory(
        stack,
        generateResourceId(resources.lambdaPaymentFlowErrorEventHandler),
        'payment-flow/',
        lambdaSourceCode,
        (settings as unknown) as { [key: string]: string },
        asyncLambdaDlq
    );
    useEventBridgeLambdaHandler(
        stack,
        UserEvents.UserCreated,
        lambda,
        bus,
        resources.eventRuleUserCreatedPaymentFlowErrorHandler,
        userDlq,
        true
    );
    return lambda;
}

export function paymentFlowNoPermissionsLambda(
    stack: Stack,
    lambdaSourceCode: string,
    bus: EventBus,
    userDlq: IQueue,
    asyncLambdaDla: IQueue
) {
    const settings: PaymentFlowHandlerLambdaSettings = {
        flowType: PaymentFlow.error,
    };
    const lambda = lambdaFactory(
        stack,
        generateResourceId(
            resources.lambdaPaymentFlowNoPermissionsEventHandler
        ),
        'payment-flow-2/',
        lambdaSourceCode,
        (settings as unknown) as { [key: string]: string },
        asyncLambdaDla
    );
    useEventBridgeLambdaHandler(
        stack,
        UserEvents.UserCreated,
        lambda,
        bus,
        resources.eventRuleUserCreatedPaymentFlowNoPermissionsHandler,
        userDlq,
        false
    );
    return lambda;
}
export interface PaymentFlowHandlerLambdaSettings {
    flowType: string;
}

export enum PaymentFlow {
    error = 'ERROR',
}
