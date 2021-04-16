import * as lambda from '@aws-cdk/aws-lambda';
import * as settings from './settings.json';
import { Duration } from '@aws-cdk/core';
import { Stack } from '@aws-cdk/core';
//import { SubscriptionFilter } from '@aws-cdk/aws-sns';

export const lambdaNodeVersion = lambda.Runtime.NODEJS_14_X;

export const defaultDynamoDBSettings = {
    readCapacity: 5,
    writeCapacity: 1,
    replicationRegions: [],
};

export const defaultLambdaSettings: LambdaCdkSettings = {
    logRetention: 30,
    timeout: Duration.seconds(30),
};

export interface LambdaCdkSettings extends CdkSettings {
    timeout: Duration;
}

export interface CdkSettings {
    logRetention: number;
}

export function generateResourceName(name: string) {
    return `${settings.environment}-${name}`;
}

export function lambdaFactory(
    stack: Stack,
    resourceName: string,
    lambdaFolderName: string,
    lambdaSourceCode: string,
    settings: { [key: string]: string }
): lambda.Function {
    return new lambda.Function(stack, generateResourceName(resourceName), {
        code: new lambda.AssetCode(`${lambdaSourceCode}${lambdaFolderName}/`),
        handler: 'index.handler',
        runtime: lambdaNodeVersion,
        environment: settings,
        logRetention: defaultLambdaSettings.logRetention,
        timeout: defaultLambdaSettings.timeout,
        tracing: lambda.Tracing.ACTIVE
    });
}

export function snsFilterHelper() {
    return {
        // filterPolicy: {
        //     color: SubscriptionFilter.stringFilter({
        //         //allowlist: ['red', 'orange'],
        //         matchPrefixes: ['bl'],
        //     }),
        //     size: SubscriptionFilter.stringFilter({
        //         //denylist: ['small', 'medium'],
        //     }),
        //     price: SubscriptionFilter.numericFilter({
        //         between: { start: 100, stop: 200 },
        //         greaterThan: 300,
        //     }),
        //     store: SubscriptionFilter.existsFilter(),
        // },
    };
}
