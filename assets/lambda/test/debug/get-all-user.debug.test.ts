import * as AwsXRay from 'aws-xray-sdk';
import { handler } from '../../src/handlers/get-all';
AwsXRay.setContextMissingStrategy('LOG_ERROR');
test('DEBUG get all users', async () => {
    //GIVEN

    process.env.TABLE_NAME = 'dev-aws-sandbox-devusersF8C2F700-UDX80QB90646';
    process.env.AWS_REGION = 'eu-central-1';
    // WHEN
    const result = await handler();

    // THEN
    expect(result).not.toBeUndefined();
    expect(result.statusCode).toBe(200);
});
