import {
    createUserEventSchema,
    UserCreatedEvent,
} from '../../events/user-event';
import { validateEventBridge } from '../../helpers/validation-helpers';
import { EventBridgeEvent } from 'aws-lambda';
import * as log from 'lambda-log';
import { getEnvironmentSettingsKey } from '../../helpers/get-environment-settings-key';
import { LambdaProxyError } from '../../helpers/lambda-proxy-error';
import {
    PaymentFlow,
    PaymentFlowHandlerLambdaSettings,
} from '../../../../../cdk/payment-flow/infrastructure';

export const handler = async (
    event: EventBridgeEvent<string, any>
): Promise<void> => {
    try {
        log.info(`event: ${JSON.stringify(event)}`);
        const model = validateEventBridge<UserCreatedEvent>(
            event,
            createUserEventSchema
        );
        log.info(`model: ${JSON.stringify(model)}`);
        const flowType = getEnvironmentSettingsKey<PaymentFlowHandlerLambdaSettings>(
            'flowType'
        );
        if (flowType === PaymentFlow.error) {
            throw new LambdaProxyError(
                500,
                'temporary issue, check the lumigo and SQS DLQ for error!'
            );
        }
    } catch (error) {
        log.error(`error: ${JSON.stringify(error)}`);
        throw error;
    }
};
