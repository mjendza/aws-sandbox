import * as envSettings from '../settings.json';
import { SubscriptionFilter } from '@aws-cdk/aws-sns';

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
