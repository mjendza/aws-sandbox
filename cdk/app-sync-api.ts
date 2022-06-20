import { Table } from '@aws-cdk/aws-dynamodb';
import { CfnOutput, Duration, Expiration, Stack } from '@aws-cdk/core';
import { replaceWithGround } from './core/cdk-helper';
import * as settings from './settings.json';
import {
    AuthorizationType,
    DynamoDbDataSource,
    GraphqlApi,
    MappingTemplate,
    Schema,
} from '@aws-cdk/aws-appsync';

export function setupAppSync(stack: Stack, users: Table) {
    const api = new GraphqlApi(stack, `graphql_api`, {
        name: replaceWithGround(`api-graphql-${settings.repositoryName}`),
        schema: Schema.fromAsset('cdk/schema.graphql'),
        authorizationConfig: {
            defaultAuthorization: {
                authorizationType: AuthorizationType.API_KEY,
                apiKeyConfig: {
                    expires: Expiration.after(Duration.days(365)),
                },
            },
        },
        xrayEnabled: true,
    });
    const dynamodbDataSource = new DynamoDbDataSource(
        stack,
        replaceWithGround(
            `api-graphql-${settings.repositoryName}-dynamo-data-source`
        ),
        {
            api,
            table: users,
            description: 'DataSource for user table',
            readOnlyAccess: true,
        }
    );

    dynamodbDataSource.createResolver({
        typeName: 'Query',
        fieldName: 'getById',
        requestMappingTemplate: MappingTemplate.dynamoDbGetItem('id', 'id'),
        responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    dynamodbDataSource.createResolver({
        typeName: 'Query',
        fieldName: 'list',
        requestMappingTemplate: MappingTemplate.dynamoDbScanTable(),
        responseMappingTemplate: MappingTemplate.dynamoDbResultList(),
    });

    // const putEventResolver = new CfnResolver(this, "PutEventMutationResolver", {
    //     apiId: appSync2EventBridgeGraphQLApi.attrApiId,
    //     typeName: "Mutation",
    //     fieldName: "putEvent",
    //     dataSourceName: dataSource.name,
    //     requestMappingTemplate: `{
    //     "version": "2018-05-29",
    //     "method": "POST",
    //     "resourcePath": "/",
    //     "params": {
    //       "headers": {
    //         "content-type": "application/x-amz-json-1.1",
    //         "x-amz-target":"AWSEvents.PutEvents"
    //       },
    //       "body": {
    //         "Entries":[
    //           {
    //             "Source":"appsync",
    //             "EventBusName": "default",
    //             "Detail":"{ \\\"event\\\": \\\"$ctx.arguments.event\\\"}",
    //             "DetailType":"Event Bridge via GraphQL"
    //            }
    //         ]
    //       }
    //     }
    //   }`,
    //     responseMappingTemplate: `## Raise a GraphQL field error in case of a datasource invocation error
    //   #if($ctx.error)
    //     $util.error($ctx.error.message, $ctx.error.type)
    //   #end
    //   ## if the response status code is not 200, then return an error. Else return the body **
    //   #if($ctx.result.statusCode == 200)
    //       ## If response is 200, return the body.
    //       {
    //         "result": "$util.parseJson($ctx.result.body)"
    //       }
    //   #else
    //       ## If response is not 200, append the response to error block.
    //       $utils.appendError($ctx.result.body, $ctx.result.statusCode)
    //   #end`
    // });
    // putEventResolver.addDependsOn(apiSchema);

    // dynamodbDataSource.createResolver({
    //     typeName: 'Query',
    //     fieldName: 'list',
    //     requestMappingTemplate: MappingTemplate.fromString(`{
    //             "version": "2017-02-28",
    //             "operation": "Query",
    //             "index": resources.dynamoDbUserHomeRegionSortedGSI,
    //             "query" : {
    //                     "expression" : "#homeRegion = :homeRegion",
    //                     "expressionNames" : {
    //                         "#homeRegion" : "homeRegion"
    //                     },
    //                     "expressionValues" : {
    //                         ":homeRegion" : $util.dynamodb.toDynamoDBJson($ctx.args.homeRegion)
    //                     }
    //                 },
    //             "limit": $util.defaultIfNull($ctx.args.limit, 25),
    //             "nextToken": $util.toJson($util.defaultIfNullOrBlank($ctx.args.nextToken, null))
    //         }`),
    //     // requestMappingTemplate: MappingTemplate.dynamoDbQuery(
    //     //     KeyCondition.eq(resources.dynamoDbUserHomeRegionSortedGSI, resources.dynamoDbUserHomeRegionSortedGSI),
    //     //     resources.dynamoDbUserHomeRegionSortedGSI
    //     // ),
    //     responseMappingTemplate: MappingTemplate.fromString(`{
    //             "items": $util.toJson($ctx.result.items),
    //             "nextToken": $util.toJson($util.defaultIfNullOrBlank($context.result.nextToken, null))
    //         }`),
    // });

    // print out the AppSync GraphQL endpoint to the terminal
    new CfnOutput(stack, 'graphql-api-url', {
        value: api.graphqlUrl,
    });

    // print out the AppSync API Key to the terminal
    new CfnOutput(stack, 'graphql-api-key', {
        value: api.apiKey || '',
    });

    // print out the stack region
    new CfnOutput(stack, 'stack-region', {
        value: stack.region,
    });
}
