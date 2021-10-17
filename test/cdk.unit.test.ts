import { expect, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as sut from '../cdk/deployment';

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
