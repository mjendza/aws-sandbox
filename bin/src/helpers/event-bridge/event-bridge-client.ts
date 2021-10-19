import { LambdaProxyError } from '../lambda-proxy-error';
import * as AWSXRay from 'aws-xray-sdk';
import AWS from "aws-sdk";

export function eventBridgeClient(region?: string) {
    const fromEnv = process.env['AWS_REGION'];
    if (!fromEnv) {
        throw new LambdaProxyError(500, "AWS_REGION can't be empty");
    }
    const awsRegion = region || fromEnv;
    return AWSXRay.captureAWSClient(new AWS.EventBridge({region: awsRegion})) as any as AWS.EventBridge;
}
