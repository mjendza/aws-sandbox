import { HttpError } from './http-error';
import {APIGatewayProxyResult} from "aws-lambda";

export function proxyIntegrationResult(code: number, jsonResult: any): APIGatewayProxyResult {
    return {
        statusCode: code,
        body: JSON.stringify(jsonResult),
        isBase64Encoded: false,
    };
}

export function proxyIntegrationError(error: any): APIGatewayProxyResult {
    const httpError = error as HttpError;
    if (!!httpError) {
        switch (httpError.statusCode) {
            case 500: {
                return proxyIntegrationResult(500, {
                    error: 'Internal Server error',
                });
            }
            default: {
                return proxyIntegrationResult(httpError.statusCode, {
                    error: JSON.stringify(httpError.message),
                });
            }
        }
    }
    return proxyIntegrationResult(500, {
        error: 'Internal Server error',
    });
}
