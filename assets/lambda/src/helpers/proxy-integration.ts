import { HttpError } from './http-error';
import { APIGatewayProxyResult } from 'aws-lambda';
import * as log from 'lambda-log';

export function proxyIntegrationResult(
    code: number,
    jsonResult: any
): APIGatewayProxyResult {
    const result = {
        statusCode: code,
        body: JSON.stringify(jsonResult),
        isBase64Encoded: false,
    };
    log.info(`LAMBDA RESULT: ${JSON.stringify(result)}`);
    return result;
}

export function proxyIntegrationError(error: any): APIGatewayProxyResult {
    log.info(`proxyIntegrationError error: ${JSON.stringify(error)}`);
    const httpErrorType = error instanceof HttpError;
    if (!!httpErrorType) {
        const httpError = error as HttpError;
        switch (httpError.statusCode) {
            case 500: {
                return proxyIntegrationResult(500, {
                    error: 'Internal Server error',
                });
            }
            default: {
                return proxyIntegrationResult(httpError.statusCode, {
                    error: httpError.message,
                });
            }
        }
    }
    return proxyIntegrationResult(500, {
        error: 'Internal Server error',
    });
}
