import * as envSettings from '../settings.json';
import { Duration } from '@aws-cdk/core';
import { SubscriptionFilter } from '@aws-cdk/aws-sns';

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
    return `${name}`;
}

export function ssmParameterBuilder(lambdaResourceName: string): string {
    return `/${envSettings.environment}/${envSettings.repositoryName}/${lambdaResourceName}`;
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

export function replaceWithGround(toConvert: string): string {
    return toConvert.replace(/-/g, '_');
}
