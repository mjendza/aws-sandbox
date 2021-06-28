import * as lambda from '@aws-cdk/aws-lambda';
import * as envSettings from './settings.json';
import { Duration } from '@aws-cdk/core';
import { Stack } from '@aws-cdk/core';
import { SubscriptionFilter } from '@aws-cdk/aws-sns';
import { StringParameter } from '@aws-cdk/aws-ssm';

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

export function generateResourceId(name: string) {
    return `${envSettings.environment}-${name}`;
}

export function ssmParameterBuilder(lambdaResourceName: string): string {
    return `/${envSettings.environment}/${envSettings.repositoryName}/${lambdaResourceName}`;
}

export function lambdaFactory(
    stack: Stack,
    lambdaResourceId: string,
    lambdaFolderName: string,
    lambdaSourceCode: string,
    settings: { [key: string]: string }
): lambda.Function {
    const lambdaInstance = new lambda.Function(stack, lambdaResourceId, {
        code: new lambda.AssetCode(`${lambdaSourceCode}${lambdaFolderName}/`),
        handler: 'index.handler',
        runtime: lambdaNodeVersion,
        environment: settings,
        logRetention: defaultLambdaSettings.logRetention,
        timeout: defaultLambdaSettings.timeout,
        tracing: lambda.Tracing.ACTIVE,
    });
    // Create a new SSM Parameter holding a lambda name
    const ssmId = generateResourceId(`${lambdaResourceId}StringParameter`);
    const ssmName = ssmParameterBuilder(lambdaResourceId);
    new StringParameter(stack, ssmId, {
        description: lambdaResourceId,
        parameterName: ssmName,
        stringValue: lambdaInstance.functionName,
        // allowedPattern: '.*',
    });
    // Grant read access to some Role
    //param.grantRead(role);
    return lambdaInstance;
}

export function snsFilterHelper() {
    return {
        filterPolicy: {
            requestId: SubscriptionFilter.stringFilter({
                denylist: ['automatic-test'],
            }),
        },
    };
}
