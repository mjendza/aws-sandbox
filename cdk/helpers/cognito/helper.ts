import { Stack } from '@aws-cdk/core';
import { CfnAuthorizer, RestApi } from '@aws-cdk/aws-apigateway';
import {
    CfnIdentityPool,
    CfnIdentityPoolRoleAttachment,
    UserPool,
    UserPoolClient,
    UserPoolClientIdentityProvider,
    UserPoolClientProps,
} from '@aws-cdk/aws-cognito';
import { FederatedPrincipal, ManagedPolicy, Role } from '@aws-cdk/aws-iam';

export function createUserPoolWithEmailSignIn(stack: Stack, id: string) {
    return new UserPool(stack, id, {
        signInAliases: {
            email: true,
        },
    });
}

export function createUserPoolClient(
    stack: Stack,
    id: string,
    userPool: UserPool
) {
    return new UserPoolClient(stack, id, userPoolClientProps(userPool));
}

export function userPoolClientProps(userPool: UserPool): UserPoolClientProps {
    return {
        userPool,
        authFlows: {
            adminUserPassword: true,
            custom: true,
            userSrp: true,
        },
        supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
    };
}

export function createIdentityPool(
    stack: Stack,
    id: string,
    userPool: UserPool,
    userPoolClient: UserPoolClient
) {
    return new CfnIdentityPool(stack, id, {
        identityPoolName: `my-${id}`,
        allowUnauthenticatedIdentities: true,
        cognitoIdentityProviders: [
            {
                clientId: userPoolClient.userPoolClientId,
                providerName: userPool.userPoolProviderName,
            },
        ],
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

export function rolesForUsers(
    stack: Stack,
    userPool: UserPool,
    userPoolClient: UserPoolClient,
    identityPool: CfnIdentityPool
) {
    const isAnonymousCognitoGroupRole = new Role(
        stack,
        'anonymous-group-role',
        {
            description: 'Default role for anonymous users',
            assumedBy: new FederatedPrincipal(
                'cognito-identity.amazonaws.com',
                {
                    StringEquals: {
                        'cognito-identity.amazonaws.com:aud': identityPool.ref,
                    },
                    'ForAnyValue:StringLike': {
                        'cognito-identity.amazonaws.com:amr': 'unauthenticated',
                    },
                },
                'sts:AssumeRoleWithWebIdentity'
            ),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AWSLambdaBasicExecutionRole'
                ),
            ],
        }
    );

    const isUserCognitoGroupRole = new Role(stack, 'users-group-role', {
        description: 'Default role for authenticated users',
        assumedBy: new FederatedPrincipal(
            'cognito-identity.amazonaws.com',
            {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': identityPool.ref,
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'authenticated',
                },
            },
            'sts:AssumeRoleWithWebIdentity'
        ),
        managedPolicies: [
            ManagedPolicy.fromAwsManagedPolicyName(
                'service-role/AWSLambdaBasicExecutionRole'
            ),
        ],
    });

    new CfnIdentityPoolRoleAttachment(stack, 'identity-pool-role-attachment', {
        identityPoolId: identityPool.ref,
        roles: {
            authenticated: isUserCognitoGroupRole.roleArn,
            unauthenticated: isAnonymousCognitoGroupRole.roleArn,
        },
        roleMappings: {
            mapping: {
                type: 'Token',
                ambiguousRoleResolution: 'AuthenticatedRole',
                identityProvider: `cognito-idp.${
                    Stack.of(stack).region
                }.amazonaws.com/${userPool.userPoolId}:${
                    userPoolClient.userPoolClientId
                }`,
            },
        },
    });
}
