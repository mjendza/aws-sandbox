import { Table, AttributeType, ProjectionType } from '@aws-cdk/aws-dynamodb';
import { App, RemovalPolicy, Stack } from '@aws-cdk/core';

export class DynamoDBStack extends Stack {
    constructor(app: App, id: string) {
        super(app, id);

        const users = new Table(this, 'users', {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING,
            },
            tableName: 'users',

            // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
            // the new table, and it will remain in your account until manually deleted. By setting the policy to
            // DESTROY, cdk destroy will delete the table (even if it has data in it)
            removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
        });

        users.addGlobalSecondaryIndex({
            indexName: 'email',
            partitionKey: { name: 'email', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
    }
}
const app = new App();
new DynamoDBStack(app, 'DynamoDBExample');
app.synth();
