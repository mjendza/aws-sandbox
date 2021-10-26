import { Stack } from '@aws-cdk/core';
import { CfnAuthorizer, RestApi } from '@aws-cdk/aws-apigateway';
import { UserPool } from '@aws-cdk/aws-cognito';

export function createUserPoolWithEmailSignIn(stack: Stack, name: string) {
    return new UserPool(stack, 'userPool', {
        signInAliases: {
            email: true,
        },
    });
}

export function authorizeApiWithCognitoPool(
    stack: Stack,
    api: RestApi,
    pool: UserPool,
    name: string
): CfnAuthorizer {
    return new CfnAuthorizer(stack, 'cfnAuth', {
        restApiId: api.restApiId,
        name: 'HelloWorldAPIAuthorizer',
        type: 'COGNITO_USER_POOLS',
        identitySource: 'method.request.header.Authorization',
        providerArns: [pool.userPoolArn],
    });
}
