import { LambdaProxyError } from './lambda-proxy-error';

const nameof = <T>(name: Extract<keyof T, string>): string => name;

export function getEnvironmentSettingsKey<T>(
    key: Extract<keyof T, string>
): string {
    const name = nameof(key);
    const result = process.env[name];
    if (!result)
        throw new LambdaProxyError(
            500,
            `Key ${name} is not a part of lambda environment.`
        );
    return result;
}
