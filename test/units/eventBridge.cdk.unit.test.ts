import * as cdk from '@aws-cdk/core';
import * as sut from '../../cdk/deployment';
import { countResources, expect, haveResource } from '@aws-cdk/assert';
import { countResourcesLike } from '@aws-cdk/assert/lib/assertions/count-resources';

test('CDK EventBridge', () => {
    //GIVEN
    const app = new cdk.App();
    // WHEN
    const stack = new sut.Deployment(app, 'MyTestStack', {});
    //THEN
    expect(stack).to(haveResource('AWS::Events::EventBus'));
    expect(stack).to(countResources('AWS::Events::EventBus', 1));
});

test('CDK EventBridge Rule - have only one to consume empty prefix (all events)', () => {
    //GIVEN
    const app = new cdk.App();
    // WHEN
    const stack = new sut.Deployment(app, 'MyTestStack', {});
    //THEN
    expect(stack).to(
        countResourcesLike('AWS::Events::Rule', 1, {
            EventPattern: {
                source: [{ prefix: '' }],
            },
        })
    );
});
