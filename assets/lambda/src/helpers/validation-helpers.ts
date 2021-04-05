import Ajv from 'ajv';
import { HttpError } from './http-error';
import { APIGatewayProxyEvent } from 'aws-lambda';

export function validate<T>(event: APIGatewayProxyEvent, schema: any): T {
    if (!event.body) {
        throw new HttpError(
            400,
            'invalid request, you are missing the parameter body'
        );
    }
    const item = JSON.parse(event.body);
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(item);

    if (!valid) {
        if (!validate.errors) {
            throw new HttpError(400, 'General validation error.');
        }
        const errors = `${validate.errors.map((x) => x.message).join(',')}`;
        throw new HttpError(400, errors);
    }
    return item as T;
}

const nameof = <T>(name: Extract<keyof T, string>): string => name;

export function getEnvironmentSettingsKey<T>(
    key: Extract<keyof T, string>
): string {
    const name = nameof(key);
    const result = process.env[name];
    if (!result)
        throw new HttpError(
            500,
            `Key ${name} is not a part of lambda environment.`
        );
    return result;
}
