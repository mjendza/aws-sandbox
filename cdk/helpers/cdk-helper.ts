import * as envSettings from '../settings.json';
import { SubscriptionFilter } from '@aws-cdk/aws-sns';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { Stack } from '@aws-cdk/core';

export const defaultDynamoDBSettings = {
    readCapacity: 5,
    writeCapacity: 1,
    replicationRegions: [],
};

export interface CdkSettings {
    logRetention: number;
}

export function generateResourceId(name: string) {
    return `${name}`;
}

export function ssmParameterBuilder(
    stack: Stack,
    id: string,
    value: string
): StringParameter {
    const ssmId = generateResourceId(id);
    const nameParametrized = `/${envSettings.environment}/${envSettings.repositoryName}/${ssmId}`;
    return new StringParameter(stack, ssmId, {
        parameterName: nameParametrized,
        stringValue: value,
        // allowedPattern: '.*',
    });
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
