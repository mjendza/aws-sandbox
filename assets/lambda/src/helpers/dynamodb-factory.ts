import * as AwsXRay from 'aws-xray-sdk';
import { DynamoDB } from 'aws-sdk';
import { HttpError } from './http-error';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export function dynamoClient(region?: string): DynamoDB.DocumentClient {
    const fromEnv = process.env['AWS_REGION'];
    if (!fromEnv) {
        throw new HttpError(500, "AWS_REGION can't be empty");
    }
    const awsRegion = region || fromEnv;
    const options: DocumentClient.DocumentClientOptions &
        DynamoDB.Types.ClientConfiguration = {
        service: new DynamoDB(),
        region: awsRegion,
    };
    const client = new DynamoDB.DocumentClient(options);
    //https://github.com/aws/aws-xray-sdk-node/issues/23
    AwsXRay.captureAWSClient((client as any).service);
    return client;
}
