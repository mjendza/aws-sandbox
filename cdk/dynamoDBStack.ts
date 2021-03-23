import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as cdk from '@aws-cdk/core';

export class DynamoDBStack extends cdk.Stack {
    constructor(app: cdk.App, id: string) {
        super(app, id);

        new dynamodb.Table(this, 'items', {
            partitionKey: {
                name: 'itemId',
                type: dynamodb.AttributeType.STRING,
            },
            tableName: 'items',

            // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
            // the new table, and it will remain in your account until manually deleted. By setting the policy to
            // DESTROY, cdk destroy will delete the table (even if it has data in it)
            removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
        });
    }
}
const app = new cdk.App();
new DynamoDBStack(app, 'DynamoDBExample');
app.synth();
