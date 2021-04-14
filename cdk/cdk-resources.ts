export interface CdkResources {
    apiGateway: string;

    lambdaCreateUser: string;
    lambdaGetAllUsers: string;
    lambdaGetUserById: string;

    dynamoDbUserTable: string;

    snsUserCreatedTopic: string;
}
export const resources: CdkResources = {
    apiGateway: 'api',

    lambdaCreateUser: 'lambda-users-create',
    lambdaGetAllUsers: 'lambda-users-get-all',
    lambdaGetUserById: 'lambda-user-get-by-id',

    dynamoDbUserTable: 'users',

    snsUserCreatedTopic: 'user-created-topic',
};
