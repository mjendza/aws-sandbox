import * as lambda from '@aws-cdk/aws-lambda';
import * as settings from './settings.json';

export const lambdaNodeVersion = lambda.Runtime.NODEJS_14_X;

export const defaultDynamoDBSettings = {
    readCapacity: 5,
    writeCapacity: 1,
    replicationRegions: [],
};

export function generateResourceName(name: string) {
    return `${settings.environment}-${settings.repositoryName}-${name}`;
}
