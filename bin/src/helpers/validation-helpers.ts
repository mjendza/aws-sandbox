import Ajv from 'ajv';
import { LambdaProxyError } from './lambda-proxy-error';
import { APIGatewayProxyEvent, EventBridgeEvent } from 'aws-lambda';
import * as log from 'lambda-log';

export function validate<T>(event: APIGatewayProxyEvent, schema: any): T {
    if (!event.body) {
        throw new LambdaProxyError(
            400,
            'invalid request, you are missing the parameter body'
        );
    }

    log.info(`event.body: ${event.body}`);
    const item = JSON.parse(event.body);
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(item);

    if (!valid) {
        if (!validate.errors) {
            throw new LambdaProxyError(400, 'General validation error.');
        }
        const errors = `${validate.errors.map((x) => x.message).join(',')}`;
        throw new LambdaProxyError(400, errors);
    }
    return item as T;
}
export function validateEntity<T>(data: any, schema: any): T {
    log.info(`event.body: ${data}`);
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
        if (!validate.errors) {
            throw new LambdaProxyError(400, 'General validation error.');
        }
        const errors = `${validate.errors.map((x) => x.message).join(',')}`;
        throw new LambdaProxyError(400, errors);
    }
    return data as T;
}
export function validateEventBridge<T>(
    event: EventBridgeEvent<string, any>,
    schema: any
): EventBridgeEvent<string, T> {
    if (!event) {
        throw new LambdaProxyError(
            400,
            'invalid request, you are missing the parameter body'
        );
    }
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(event.detail);

    if (!valid) {
        if (!validate.errors) {
            throw new LambdaProxyError(400, 'General validation error.');
        }
        const errors = `${validate.errors.map((x) => x.message).join(',')}`;
        throw new LambdaProxyError(400, errors);
    }
    return event as EventBridgeEvent<string, T>;
}
