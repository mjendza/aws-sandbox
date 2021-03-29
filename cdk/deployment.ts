import {
    Table,
    AttributeType,
    ProjectionType,
    BillingMode,
} from '@aws-cdk/aws-dynamodb';
import { App, RemovalPolicy, Stack } from '@aws-cdk/core';
import {
    defaultDynamoDBSettings,
    generateResourceName,
    lambdaNodeVersion,
} from './cdkHelper';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import { addCorsOptions } from './deployment-base';
import * as settings from './settings.json';
import { resources } from './cdkResources';

export class Deployment extends Stack {
    private lambdaSourceCode = 'assets/lambda/src';

    constructor(app: App, id: string) {
        super(app, id);

        const users = new Table(
            this,
            generateResourceName(resources.dynamoDbUserTable),
            {
                partitionKey: {
                    name: 'id',
                    type: AttributeType.STRING,
                },
                billingMode: BillingMode.PAY_PER_REQUEST,
                replicationRegions: defaultDynamoDBSettings.replicationRegions,

                // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
                // the new table, and it will remain in your account until manually deleted. By setting the policy to
                // DESTROY, cdk destroy will delete the table (even if it has data in it)
                removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
            }
        );

        users.addGlobalSecondaryIndex({
            indexName: 'email',
            partitionKey: { name: 'email', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL
        });

        const createOne = new lambda.Function(
            this,
            generateResourceName(resources.lambdaCreateUser),
            {
                code: new lambda.AssetCode(this.lambdaSourceCode),
                handler: 'create.handler',
                runtime: lambdaNodeVersion,
                environment: {
                    USER_TABLE_NAME: users.tableName,
                },
            }
        );
        users.grantReadWriteData(createOne);

        const api = new apigateway.RestApi(
            this,
            `api-gateway-${settings.repositoryName}`,
            {
                restApiName: `api-${settings.repositoryName}`,
            }
        );
        const items = api.root.addResource('users');

        const createOneIntegration = new apigateway.LambdaIntegration(
            createOne
        );
        items.addMethod('POST', createOneIntegration);
        addCorsOptions(items);
    }
}
const app = new App();
new Deployment(app, `${settings.environment}-${settings.repositoryName}`);
app.synth();
