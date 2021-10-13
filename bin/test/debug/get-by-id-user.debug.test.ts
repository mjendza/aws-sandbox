import * as AwsXRay from 'aws-xray-sdk';
import { handler } from '../../src/handlers/get-by-id';
import { APIGatewayProxyEvent } from 'aws-lambda';
AwsXRay.setContextMissingStrategy('LOG_ERROR');
test('DEBUG get by id user', async () => {
    //GIVEN
    const event: APIGatewayProxyEvent = {
        pathParameters: { id: '613d83bb-0242-4502-8fc2-fb76d036090e' },
    } as any;
    process.env.TABLE_NAME = 'dev-aws-sandbox-devusersF8C2F700-V0VS4IMNIG4R';
    process.env.AWS_REGION = 'eu-central-1';
    // WHEN
    const result = await handler(event);

    // THEN
    expect(result).not.toBeUndefined();
    expect(result.statusCode).toBe(200);
});
