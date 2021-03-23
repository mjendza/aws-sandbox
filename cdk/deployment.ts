import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { lambdaNodeVersion } from './cdkHelper';

export class ApiLambdaCrudDynamoDBStack extends cdk.Stack {
    private lambdaSourceCode = 'assets/lambda/src';
    constructor(app: cdk.App, id: string) {
        super(app, id);

        const dynamoTable = new dynamodb.Table(this, 'items', {
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

        const getOne = new lambda.Function(this, 'getOneItemFunction', {
            code: new lambda.AssetCode(this.lambdaSourceCode),
            handler: 'get-one.handler',
            runtime: lambdaNodeVersion,
            environment: {
                TABLE_NAME: dynamoTable.tableName,
                PRIMARY_KEY: 'itemId',
            },
        });

        const getAll = new lambda.Function(this, 'getAllItemsFunction', {
            code: new lambda.AssetCode(this.lambdaSourceCode),
            handler: 'get-all.handler',
            runtime: lambdaNodeVersion,
            environment: {
                TABLE_NAME: dynamoTable.tableName,
                PRIMARY_KEY: 'itemId',
            },
        });

        const createOne = new lambda.Function(this, 'createItemFunction', {
            code: new lambda.AssetCode(this.lambdaSourceCode),
            handler: 'create.handler',
            runtime: lambdaNodeVersion,
            environment: {
                TABLE_NAME: dynamoTable.tableName,
                PRIMARY_KEY: 'itemId',
            },
        });

        const updateOne = new lambda.Function(this, 'updateItemFunction', {
            code: new lambda.AssetCode(this.lambdaSourceCode),
            handler: 'update-one.handler',
            runtime: lambdaNodeVersion,
            environment: {
                TABLE_NAME: dynamoTable.tableName,
                PRIMARY_KEY: 'itemId',
            },
        });

        const deleteOne = new lambda.Function(this, 'deleteItemFunction', {
            code: new lambda.AssetCode(this.lambdaSourceCode),
            handler: 'delete-one.handler',
            runtime: lambdaNodeVersion,
            environment: {
                TABLE_NAME: dynamoTable.tableName,
                PRIMARY_KEY: 'itemId',
            },
        });

        dynamoTable.grantReadData(getAll);
        dynamoTable.grantReadData(getOne);
        dynamoTable.grantReadWriteData(createOne);
        dynamoTable.grantReadWriteData(updateOne);
        dynamoTable.grantReadWriteData(deleteOne);

        const api = new apigateway.RestApi(this, 'itemsApi', {
            restApiName: 'Items Service',
        });

        const items = api.root.addResource('items');
        const getAllIntegration = new apigateway.LambdaIntegration(getAll);
        items.addMethod('GET', getAllIntegration);

        const createOneIntegration = new apigateway.LambdaIntegration(
            createOne
        );
        items.addMethod('POST', createOneIntegration);
        addCorsOptions(items);

        const singleItem = items.addResource('{id}');
        const getOneIntegration = new apigateway.LambdaIntegration(getOne);
        singleItem.addMethod('GET', getOneIntegration);

        const updateOneIntegration = new apigateway.LambdaIntegration(
            updateOne
        );
        singleItem.addMethod('PATCH', updateOneIntegration);

        const deleteOneIntegration = new apigateway.LambdaIntegration(
            deleteOne
        );
        singleItem.addMethod('DELETE', deleteOneIntegration);
        addCorsOptions(singleItem);
    }
}

export function addCorsOptions(apiResource: apigateway.IResource) {
    apiResource.addMethod(
        'OPTIONS',
        new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers':
                            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                        'method.response.header.Access-Control-Allow-Origin':
                            "'*'",
                        'method.response.header.Access-Control-Allow-Credentials':
                            "'false'",
                        'method.response.header.Access-Control-Allow-Methods':
                            "'OPTIONS,GET,PUT,POST,DELETE'",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                'application/json': '{"statusCode": 200}',
            },
        }),
        {
            methodResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers': true,
                        'method.response.header.Access-Control-Allow-Methods': true,
                        'method.response.header.Access-Control-Allow-Credentials': true,
                        'method.response.header.Access-Control-Allow-Origin': true,
                    },
                },
            ],
        }
    );
}

const app = new cdk.App();
new ApiLambdaCrudDynamoDBStack(app, 'ApiLambdaCrudDynamoDBExample');
app.synth();
