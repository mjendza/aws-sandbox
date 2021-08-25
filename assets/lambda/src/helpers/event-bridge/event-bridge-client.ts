import { LambdaProxyError } from '../lambda-proxy-error';
import * as uninstrumentedAWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
export function eventBridgeClient(region?: string) {
    const fromEnv = process.env['AWS_REGION'];
    if (!fromEnv) {
        throw new LambdaProxyError(500, "AWS_REGION can't be empty");
    }
    const awsRegion = region || fromEnv;

    const AWS = AWSXRay.captureAWS(uninstrumentedAWS);
    const eventBridge = new AWS.EventBridge({ region: awsRegion });
    return eventBridge;
}
