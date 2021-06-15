import { dynamoClient } from '../../helpers/dynamodb-factory';
import { resources } from '../../../../../cdk/cdk-resources';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export const handler = async (): Promise<any> => {
    const TABLE_NAME = process.env.TABLE_NAME || '';

    const params: DocumentClient.QueryInput = {
        TableName: TABLE_NAME,
        ScanIndexForward: true,
        KeyConditionExpression: `${resources.dynamoDbUserHomeRegionSortedGSI} = :value`,
        ExpressionAttributeValues: {
            ':value': 'eu-central-1',
        },
        IndexName: resources.dynamoDbUserHomeRegionSortedGSI,
    };
    try {
        const db = dynamoClient();
        const response = await db.query(params).promise();
        return { statusCode: 200, body: JSON.stringify(response.Items) };
    } catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};
