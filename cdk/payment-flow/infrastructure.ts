import { generateResourceId, lambdaFactory } from '../cdk-helper';
import { resources } from '../cdk-resources';
import { Stack } from '@aws-cdk/core';
import { useEventBridgeLambdaHandler } from '../helpers/event-bridge/lambda-helpers';
import { UserEvents } from '../../assets/lambda/src/events/user-event';
import { EventBus } from '@aws-cdk/aws-events';
import { IQueue } from '@aws-cdk/aws-sqs';

export function paymentFlowLambda(
    stack: Stack,
    lambdaSourceCode: string,
    bus: EventBus,
    userDlq: IQueue
) {
    const settings: PaymentFlowHandlerLambdaSettings = {
        flowType: PaymentFlow.error,
    };
    const lambda = lambdaFactory(
        stack,
        generateResourceId(resources.lambdaPaymentFlowEventHandler),
        'payment-flow/',
        lambdaSourceCode,
        (settings as unknown) as { [key: string]: string }
    );
    useEventBridgeLambdaHandler(
        stack,
        UserEvents.UserCreated,
        lambda,
        bus,
        resources.eventRuleUserCreatedHandler,
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
