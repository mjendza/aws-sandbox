import { Stack } from '@aws-cdk/core';
import { CfnAuthorizer, RestApi } from '@aws-cdk/aws-apigateway';
import { UserPool } from '@aws-cdk/aws-cognito';

export function createUserPoolWithEmailSignIn(stack: Stack, id: string) {
    return new UserPool(stack, id, {
        signInAliases: {
            email: true,
        },
    });
}

export function authorizeApiWithCognitoPool(
    stack: Stack,
    api: RestApi,
    pool: UserPool,
    id: string
): CfnAuthorizer {
    return new CfnAuthorizer(stack, id, {
        restApiId: api.restApiId,
        name: `${id}-Authorizer`,
        type: 'COGNITO_USER_POOLS',
        identitySource: 'method.request.header.Authorization',
        providerArns: [pool.userPoolArn],
    });
}
