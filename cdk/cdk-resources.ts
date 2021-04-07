export interface CdkResources {
    apiGateway: string;
    lambdaCreateUser: string;
    lambdaGetAllUsers: string;
    dynamoDbUserTable: string;
}
export const resources: CdkResources = {
    apiGateway: 'api',
    lambdaCreateUser: 'lambda-create-user',
    lambdaGetAllUsers: 'lambda-get-all-users',
    dynamoDbUserTable: 'users',
};
