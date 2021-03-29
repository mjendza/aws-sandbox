import * as lambda from '@aws-cdk/aws-lambda';
import * as settings from './settings.json';
import * as cdk from '@aws-cdk/core';

export const lambdaNodeVersion = lambda.Runtime.NODEJS_14_X;

export const defaultDynamoDBSettings = {
    readCapacity: 5,
    writeCapacity: 1,
    replicationRegions: [],
};

export const defaultLambdaSettings = {
    logRetention: 30,
    timeout: cdk.Duration.seconds(30),
};

export function generateResourceName(name: string) {
    return `${settings.environment}-${settings.repositoryName}-${name}`;
}
