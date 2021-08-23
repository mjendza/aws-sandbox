import {
    countResources,
    expect,
    haveResource,
    haveResourceLike,
} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as sut from '../cdk/deployment';
import { countResourcesLike } from '@aws-cdk/assert/lib/assertions/count-resources';

test('CDK API Gateway REST APIs', () => {
    //GIVEN
    const app = new cdk.App();
    // WHEN
    const stack = new sut.Deployment(app, 'MyTestStack', {});
    // THEN
    expect(stack).to(haveResource('AWS::ApiGateway::RestApi'));
});

test('CDK DynamoDB table', () => {
    //GIVEN
    const app = new cdk.App();
    // WHEN
    const stack = new sut.Deployment(app, 'MyTestStack', {});
    // THEN
    expect(stack).to(haveResource('AWS::DynamoDB::Table'));
});

test('CDK Lambda functions', () => {
    //GIVEN
    const app = new cdk.App();
    // WHEN
    const stack = new sut.Deployment(app, 'MyTestStack', {});
    //THEN
    const result = haveResourceLike('AWS::Lambda::Function', {
        Handler: 'index.handler',
        Runtime: 'nodejs14.x',
    });
    expect(stack).to(result);
    expect(stack).to(countResources('AWS::Lambda::Function', 9));
});

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
