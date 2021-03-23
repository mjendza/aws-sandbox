import { expect as expectCDK, beASupersetOfTemplate, exactlyMatchTemplate } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import sut = require('../cdk/deployment');

test('exact match (case 1)', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new sut.ApiLambdaCrudDynamoDBStack(app, 'MyTestStack');

    // Case 1 - exact match
    expectCDK(stack).to(exactlyMatchTemplate({
        "Resources": {
            "testbucketE6E05ABE": {
                "Type": "AWS::S3::Bucket",
                "Properties": {
                    "BucketName": "test-bucket",
                    "VersioningConfiguration": {
                        "Status": "Enabled"
                    }
                },
                "UpdateReplacePolicy": "Retain",
                "DeletionPolicy": "Retain"
            }
        }
    }))
});

test('superset match (case 2)', () => {
    const app = new cdk.App();
    const stack = new sut.ApiLambdaCrudDynamoDBStack(app, 'MyTestStack');
    expectCDK(stack).to(beASupersetOfTemplate({
        "Resources": {
            "testbucketE6E05ABE": {
                "Type": "AWS::S3::Bucket",
                "Properties": {
                    "BucketName": "test-bucket",
                    "VersioningConfiguration": {
                        "Status": "Enabled"
                    }
                },
                "UpdateReplacePolicy": "Retain",
                // XXX - commented out the following... should work?
                // "DeletionPolicy": "Retain"
            }
        }
    }))
})

test('superset match (case 3)', () => {
    const app = new cdk.App();
    const stack = new sut.ApiLambdaCrudDynamoDBStack(app, 'MyTestStack');
    expectCDK(stack).to(beASupersetOfTemplate({
        "Resources": {
            "testbucketE6E05ABE": {
                "Type": "AWS::S3::Bucket",
                "Properties": {
                    "BucketName": "test-bucket",
                    "VersioningConfiguration": {
                        "Status": "Enabled"
                    }
                },
                "UpdateReplacePolicy": "Retain",
                "DeletionPolicy": "Retain",
                // addd new attribute not from the stack definition -- should fail?
                "ObjectLockEnabled" : true,
            }
        }
    }))
});