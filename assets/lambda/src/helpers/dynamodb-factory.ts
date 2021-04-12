import * as AwsXRay from 'aws-xray-sdk';
import { DynamoDB } from 'aws-sdk';
import { LambdaProxyError } from './lambda-proxy-error';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as log from 'lambda-log';

export function dynamoClient(region?: string): DynamoDB.DocumentClient {
    const fromEnv = process.env['AWS_REGION'];
    if (!fromEnv) {
        throw new LambdaProxyError(500, "AWS_REGION can't be empty");
    }
    const awsRegion = region || fromEnv;
    const options: DocumentClient.DocumentClientOptions &
        DynamoDB.Types.ClientConfiguration = {
        service: new DynamoDB(),
        region: awsRegion,
    };
    log.info(`dynamoClient options: ${JSON.stringify(options)}`);
    const client = new DynamoDB.DocumentClient(options);
    //https://github.com/aws/aws-xray-sdk-node/issues/23
    AwsXRay.captureAWSClient((client as any).service);
    return client;
}
