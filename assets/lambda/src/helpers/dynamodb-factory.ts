import * as AWSXRay from "aws-xray-sdk";
import { DynamoDB } from 'aws-sdk';

export function dynamoClient(): DynamoDB.DocumentClient{
    return AWSXRay.captureAWSClient(new DynamoDB.DocumentClient());
}