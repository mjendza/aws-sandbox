export interface CdkResources {
    apiGateway: string;
    lambdaCreateUser: string;
    dynamoDbUserTable: string;
}
export const resources: CdkResources = {
    apiGateway: 'api',
    lambdaCreateUser: 'lambda-create-user',
    dynamoDbUserTable: 'users',
};
