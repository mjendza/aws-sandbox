import { expect as expectCDK, exactlyMatchTemplate } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as sut from '../cdk/deployment';

test('exact match (case 1)', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new sut.Deployment(app, 'MyTestStack');

    // Case 1 - exact match
    expectCDK(stack).to(
        exactlyMatchTemplate({
            Resources: {
                items07D08F4B: {
                    Type: 'AWS::DynamoDB::Table',
                    Properties: {
                        KeySchema: [
                            {
                                AttributeName: 'id',
                                KeyType: 'HASH',
                            },
                        ],
                        AttributeDefinitions: [
                            {
                                AttributeName: 'id',
                                AttributeType: 'S',
                            },
                        ],
                    },
                    UpdateReplacePolicy: 'Delete',
                    DeletionPolicy: 'Delete',
                },
            },
        })
    );
});
