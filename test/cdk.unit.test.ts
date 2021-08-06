import {
    countResources,
    expect,
    haveResource,
    haveResourceLike,
} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as sut from '../cdk/deployment';
const stack = getSut();
test('CDK API Gateway REST APIs', () => {
    expect(stack).to(haveResource('AWS::ApiGateway::RestApi'));
});

test('CDK DynamoDB table', () => {
    expect(stack).to(haveResource('AWS::DynamoDB::Table'));
});

test('CDK Lambda functions', () => {
    const result = haveResourceLike('AWS::Lambda::Function', {
        Handler: 'index.handler',
        Runtime: 'nodejs14.x',
    });
    expect(stack).to(result);
    expect(stack).to(countResources('AWS::Lambda::Function', 9));
});

test('CDK EventBridge', () => {
    expect(stack).to(haveResource('AWS::Events::EventBus'));
    expect(stack).to(countResources('AWS::Events::EventBus', 1));
});

// test('CDK Policy for action events:PutEvents', () => {
//     expect(stack).to(haveResource('AWS::IAM::Policy', {
//         PolicyDocument: {
//             Statement: [
//                 {
//                     Action: 'events:PutEvents',
//                     Effect: 'Allow',
//                     Resource: '*',
//                 },
//             ],
//             Version: '2012-10-17',
//         },
//     }));
// });

function getSut() {
    const app = new cdk.App();
    return new sut.Deployment(app, 'MyTestStack', {});
}
