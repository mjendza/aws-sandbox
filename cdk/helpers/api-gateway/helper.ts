import {
    AuthorizationType,
    CfnAuthorizer,
    IResource,
    LambdaIntegration,
    MockIntegration,
    PassthroughBehavior,
    Resource,
} from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';

export function addMethodWithAuthorization(
    usersApiEndpoint: Resource,
    method: string,
    lambda: lambda.Function,
    authorizer: CfnAuthorizer
) {
    const options = {
        authorizationType: AuthorizationType.COGNITO,
        authorizer: {
            authorizerId: authorizer.ref,
        },
    };
    const createOneIntegration = new LambdaIntegration(lambda);
    usersApiEndpoint.addMethod(method, createOneIntegration, options);
    addCorsOptions(usersApiEndpoint);
}

export function addCorsOptions(apiResource: IResource) {
    apiResource.addMethod(
        'OPTIONS',
        new MockIntegration({
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
            passthroughBehavior: PassthroughBehavior.NEVER,
            requestTemplates: {
                'application/json': '{"statusCode": 200}',
            },
        }),
        {
            methodResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers':
                            true,
                        'method.response.header.Access-Control-Allow-Methods':
                            true,
                        'method.response.header.Access-Control-Allow-Credentials':
                            true,
                        'method.response.header.Access-Control-Allow-Origin':
                            true,
                    },
                },
            ],
        }
    );
}
