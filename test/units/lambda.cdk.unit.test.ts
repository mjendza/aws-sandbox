import * as cdk from '@aws-cdk/core';
import * as sut from '../../cdk/deployment';
import { expect } from '@aws-cdk/assert';
import { countResourcesLike } from '@aws-cdk/assert/lib/assertions/count-resources';

test('should have all lambdas with nodejs14 and handler as index', () => {
    //GIVEN
    const app = new cdk.App();
    // WHEN
    const stack = new sut.Deployment(app, 'MyTestStack', {});
    //THEN
    expect(stack).to(
        countResourcesLike('AWS::Lambda::Function', 7, {
            Handler: 'index.handler',
            Runtime: 'nodejs14.x',
        })
    );
});
