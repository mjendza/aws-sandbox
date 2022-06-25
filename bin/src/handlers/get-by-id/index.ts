import {
    proxyIntegrationError,
    proxyIntegrationResult,
} from '../../helpers/proxy-integration';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as log from 'lambda-log';
import { LambdaProxyError } from '../../helpers/lambda-proxy-error';
import { dynamoClient } from '../../helpers/dynamodb-factory';
import { GetUserService } from '../../users/get-user-service';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        log.info(`event: ${JSON.stringify(event)}`);
        if (!event.pathParameters) {
            throw new LambdaProxyError(400, 'Missing id path parameter.');
        }
        const id = event.pathParameters['id'];
        if (!id) {
            throw new LambdaProxyError(400, 'Missing id path parameter.');
        }
        const service = new GetUserService(dynamoClient());
        const result = await service.get(id);
        return proxyIntegrationResult(200, result);
    } catch (error) {
        return proxyIntegrationError(error);
    }
};
