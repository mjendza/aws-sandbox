import { Duration, Stack } from '@aws-cdk/core';
import { IQueue } from '@aws-cdk/aws-sqs';
import * as lambda from '@aws-cdk/aws-lambda';
import {
    maximumEventAgeDuration,
    maximumRetryAttempts,
} from '../event-driven-processing/helpers';
import { StringParameter } from '@aws-cdk/aws-ssm';
import {
    CdkSettings,
    generateResourceId,
    ssmParameterBuilder,
} from '../cdk-helper';

export const defaultLambdaSettings: LambdaCdkSettings = {
    logRetention: 30,
    timeout: Duration.seconds(30),
};
export const lambdaNodeVersion = lambda.Runtime.NODEJS_14_X;

export interface LambdaCdkSettings extends CdkSettings {
    timeout: Duration;
}

export function lambdaBuilder(
    stack: Stack,
    lambdaResourceId: string,
    lambdaFolderName: string,
    lambdaSourceCode: string,
    settings: { [key: string]: string },
    asyncLambdaDlq: IQueue | undefined
): lambda.Function {
    const lambdaMaxEventAge = asyncLambdaDlq
        ? maximumEventAgeDuration
        : undefined;
    const lambdaRetryAttempts = asyncLambdaDlq
        ? maximumRetryAttempts
        : undefined;
    const lambdaInstance = new lambda.Function(stack, lambdaResourceId, {
        code: new lambda.AssetCode(`${lambdaSourceCode}${lambdaFolderName}/`),
        handler: 'index.handler',
        runtime: lambdaNodeVersion,
        environment: settings,
        logRetention: defaultLambdaSettings.logRetention,
        timeout: defaultLambdaSettings.timeout,
        tracing: lambda.Tracing.ACTIVE,
        deadLetterQueue: asyncLambdaDlq,
        maxEventAge: lambdaMaxEventAge,
        retryAttempts: lambdaRetryAttempts,
    });

    const ssmId = generateResourceId(`${lambdaResourceId}StringParameter`);
    const ssmName = ssmParameterBuilder(lambdaResourceId);
    new StringParameter(stack, ssmId, {
        description: lambdaResourceId,
        parameterName: ssmName,
        stringValue: lambdaInstance.functionName,
        // allowedPattern: '.*',
    });
    return lambdaInstance;
}
