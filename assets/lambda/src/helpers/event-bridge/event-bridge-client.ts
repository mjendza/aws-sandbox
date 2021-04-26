import { LambdaProxyError } from '../lambda-proxy-error';
import { EventBridge } from 'aws-sdk';

export function eventBridgeClient(region?: string) {
    const fromEnv = process.env['AWS_REGION'];
    if (!fromEnv) {
        throw new LambdaProxyError(500, "AWS_REGION can't be empty");
    }
    const awsRegion = region || fromEnv;
    return new EventBridge({ region: awsRegion });
}
