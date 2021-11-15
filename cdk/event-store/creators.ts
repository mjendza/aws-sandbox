import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import { SystemLambdaSettings } from '../settings/system-lambda-settings';
import { lambdaBuilder } from '../helpers/lambda/lambda-builder';
import {
    defaultDynamoDBSettings,
    generateResourceId,
} from '../helpers/cdk-helper';
import { resources } from '../cdk-resources';
import { RemovalPolicy, Stack } from '@aws-cdk/core';

export function systemEventStoreLambda(
    stack: Stack,
    eventStore: Table,
    lambdaSourceCode: string
): lambda.Function {
    const createOneSettings: SystemLambdaSettings = {
        SYSTEM_TABLE_NAME: eventStore.tableName,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    };
    const createOne = lambdaBuilder(
        stack,
        generateResourceId(resources.lambdaEventStore),
        'event-store/',
        lambdaSourceCode,
        createOneSettings as unknown as { [key: string]: string },
        undefined
    );

    eventStore.grantReadWriteData(createOne);

    return createOne;
}

export function createSystemEventStoreTable(stack: Stack): Table {
    return new Table(
        stack,
        generateResourceId(resources.dynamoDbEventStoreTable),
        {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            replicationRegions: defaultDynamoDBSettings.replicationRegions,

            // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
            // the new table, and it will remain in your account until manually deleted. By setting the policy to
            // DESTROY, cdk destroy will delete the table (even if it has data in it)
            removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
        }
    );
}
