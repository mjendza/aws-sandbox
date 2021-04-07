import * as AwsXRay from 'aws-xray-sdk';
import { handler } from '../../src/handlers/create';
AwsXRay.setContextMissingStrategy('LOG_ERROR');
test('DEBUG create user', async () => {
    //GIVEN
    const event = {
        body: JSON.stringify({
            email: 'abc',
        }),
    } as any;
    process.env.TABLE_NAME = 'dev-aws-sandbox-devusersF8C2F700-1RZSWESM7TEDP';
    process.env.AWS_REGION = 'eu-central-1';
    // WHEN
    const result = await handler(event);

    // THEN
    expect(result).not.toBeUndefined();
    expect(result.statusCode).toBe(201);
});
