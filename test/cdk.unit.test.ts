import { expect, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as sut from '../cdk/deployment';

test('API Gateway REST APIs created', () => {
    //GIVEN
    const app = new cdk.App();
    // WHEN
    const stack = new sut.Deployment(app, 'MyTestStack');
    // THEN
    expect(stack).to(haveResource('AWS::ApiGateway::RestApi'));
});

test('DynamoDB table created', () => {
    //GIVEN
    const app = new cdk.App();
    // WHEN
    const stack = new sut.Deployment(app, 'MyTestStack');
    // THEN
    expect(stack).to(haveResource('AWS::DynamoDB::Table'));
});

test('Lambda functions created', () => {
    //GIVEN
    const app = new cdk.App();
    // WHEN
    const stack = new sut.Deployment(app, 'MyTestStack');
    //THEN
    expect(stack).to(
        haveResource('AWS::Lambda::Function', {
            Handler: 'index.handler',
            Runtime: 'nodejs14.x',
        })
    );
});
