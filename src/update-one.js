"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`, DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;
const handler = async (event = {}) => {
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const editedItemId = event.pathParameters.id;
    if (!editedItemId) {
        return { statusCode: 400, body: 'invalid request, you are missing the path parameter id' };
    }
    const editedItem = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const editedItemProperties = Object.keys(editedItem);
    if (!editedItem || editedItemProperties.length < 1) {
        return { statusCode: 400, body: 'invalid request, no arguments provided' };
    }
    const firstProperty = editedItemProperties.splice(0, 1);
    const params = {
        TableName: TABLE_NAME,
        Key: {
            [PRIMARY_KEY]: editedItemId
        },
        UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW'
    };
    params.ExpressionAttributeValues[`:${firstProperty}`] = editedItem[`${firstProperty}`];
    editedItemProperties.forEach(property => {
        params.UpdateExpression += `, ${property} = :${property}`;
        params.ExpressionAttributeValues[`:${property}`] = editedItem[property];
    });
    try {
        await db.update(params).promise();
        return { statusCode: 204, body: '' };
    }
    catch (dbError) {
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return { statusCode: 500, body: errorResponse };
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLW9uZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVwZGF0ZS1vbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLE1BQU0sRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM3QyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7QUFDaEQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO0FBRWxELE1BQU0saUJBQWlCLEdBQUcseURBQXlELEVBQ2pGLHdCQUF3QixHQUFHLCtGQUErRixDQUFDO0FBRXRILE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxRQUFhLEVBQUUsRUFBa0IsRUFBRTtJQUUvRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtRQUNmLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxxREFBcUQsRUFBRSxDQUFDO0tBQ3pGO0lBRUQsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7SUFDN0MsSUFBSSxDQUFDLFlBQVksRUFBRTtRQUNqQixPQUFPLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsd0RBQXdELEVBQUUsQ0FBQztLQUM1RjtJQUVELE1BQU0sVUFBVSxHQUFRLE9BQU8sS0FBSyxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVGLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyRCxJQUFJLENBQUMsVUFBVSxJQUFJLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDaEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLHdDQUF3QyxFQUFFLENBQUM7S0FDOUU7SUFFRCxNQUFNLGFBQWEsR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELE1BQU0sTUFBTSxHQUFRO1FBQ2hCLFNBQVMsRUFBRSxVQUFVO1FBQ3JCLEdBQUcsRUFBRTtZQUNILENBQUMsV0FBVyxDQUFDLEVBQUUsWUFBWTtTQUM1QjtRQUNELGdCQUFnQixFQUFFLE9BQU8sYUFBYSxPQUFPLGFBQWEsRUFBRTtRQUM1RCx5QkFBeUIsRUFBRSxFQUFFO1FBQzdCLFlBQVksRUFBRSxhQUFhO0tBQzlCLENBQUE7SUFDRCxNQUFNLENBQUMseUJBQXlCLENBQUMsSUFBSSxhQUFhLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFFdkYsb0JBQW9CLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQ3BDLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxLQUFLLFFBQVEsT0FBTyxRQUFRLEVBQUUsQ0FBQztRQUMxRCxNQUFNLENBQUMseUJBQXlCLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1RSxDQUFDLENBQUMsQ0FBQztJQUVILElBQUk7UUFDRixNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO0tBQ3RDO0lBQUMsT0FBTyxPQUFPLEVBQUU7UUFDaEIsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLElBQUksS0FBSyxxQkFBcUIsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDOUcsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO1FBQzdDLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsQ0FBQztLQUNqRDtBQUNILENBQUMsQ0FBQztBQTFDVyxRQUFBLE9BQU8sV0EwQ2xCIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQVdTID0gcmVxdWlyZSgnYXdzLXNkaycpO1xyXG5jb25zdCBkYiA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcclxuY29uc3QgVEFCTEVfTkFNRSA9IHByb2Nlc3MuZW52LlRBQkxFX05BTUUgfHwgJyc7XHJcbmNvbnN0IFBSSU1BUllfS0VZID0gcHJvY2Vzcy5lbnYuUFJJTUFSWV9LRVkgfHwgJyc7XHJcblxyXG5jb25zdCBSRVNFUlZFRF9SRVNQT05TRSA9IGBFcnJvcjogWW91J3JlIHVzaW5nIEFXUyByZXNlcnZlZCBrZXl3b3JkcyBhcyBhdHRyaWJ1dGVzYCxcclxuICBEWU5BTU9EQl9FWEVDVVRJT05fRVJST1IgPSBgRXJyb3I6IEV4ZWN1dGlvbiB1cGRhdGUsIGNhdXNlZCBhIER5bmFtb2RiIGVycm9yLCBwbGVhc2UgdGFrZSBhIGxvb2sgYXQgeW91ciBDbG91ZFdhdGNoIExvZ3MuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBhbnkgPSB7fSkgOiBQcm9taXNlIDxhbnk+ID0+IHtcclxuXHJcbiAgaWYgKCFldmVudC5ib2R5KSB7XHJcbiAgICByZXR1cm4geyBzdGF0dXNDb2RlOiA0MDAsIGJvZHk6ICdpbnZhbGlkIHJlcXVlc3QsIHlvdSBhcmUgbWlzc2luZyB0aGUgcGFyYW1ldGVyIGJvZHknIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBlZGl0ZWRJdGVtSWQgPSBldmVudC5wYXRoUGFyYW1ldGVycy5pZDtcclxuICBpZiAoIWVkaXRlZEl0ZW1JZCkge1xyXG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZTogNDAwLCBib2R5OiAnaW52YWxpZCByZXF1ZXN0LCB5b3UgYXJlIG1pc3NpbmcgdGhlIHBhdGggcGFyYW1ldGVyIGlkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZWRpdGVkSXRlbTogYW55ID0gdHlwZW9mIGV2ZW50LmJvZHkgPT0gJ29iamVjdCcgPyBldmVudC5ib2R5IDogSlNPTi5wYXJzZShldmVudC5ib2R5KTtcclxuICBjb25zdCBlZGl0ZWRJdGVtUHJvcGVydGllcyA9IE9iamVjdC5rZXlzKGVkaXRlZEl0ZW0pO1xyXG4gIGlmICghZWRpdGVkSXRlbSB8fCBlZGl0ZWRJdGVtUHJvcGVydGllcy5sZW5ndGggPCAxKSB7XHJcbiAgICAgIHJldHVybiB7IHN0YXR1c0NvZGU6IDQwMCwgYm9keTogJ2ludmFsaWQgcmVxdWVzdCwgbm8gYXJndW1lbnRzIHByb3ZpZGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZmlyc3RQcm9wZXJ0eSA9IGVkaXRlZEl0ZW1Qcm9wZXJ0aWVzLnNwbGljZSgwLDEpO1xyXG4gIGNvbnN0IHBhcmFtczogYW55ID0ge1xyXG4gICAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUUsXHJcbiAgICAgIEtleToge1xyXG4gICAgICAgIFtQUklNQVJZX0tFWV06IGVkaXRlZEl0ZW1JZFxyXG4gICAgICB9LFxyXG4gICAgICBVcGRhdGVFeHByZXNzaW9uOiBgc2V0ICR7Zmlyc3RQcm9wZXJ0eX0gPSA6JHtmaXJzdFByb3BlcnR5fWAsXHJcbiAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHt9LFxyXG4gICAgICBSZXR1cm5WYWx1ZXM6ICdVUERBVEVEX05FVydcclxuICB9XHJcbiAgcGFyYW1zLkV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbYDoke2ZpcnN0UHJvcGVydHl9YF0gPSBlZGl0ZWRJdGVtW2Ake2ZpcnN0UHJvcGVydHl9YF07XHJcblxyXG4gIGVkaXRlZEl0ZW1Qcm9wZXJ0aWVzLmZvckVhY2gocHJvcGVydHkgPT4ge1xyXG4gICAgICBwYXJhbXMuVXBkYXRlRXhwcmVzc2lvbiArPSBgLCAke3Byb3BlcnR5fSA9IDoke3Byb3BlcnR5fWA7XHJcbiAgICAgIHBhcmFtcy5FeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzW2A6JHtwcm9wZXJ0eX1gXSA9IGVkaXRlZEl0ZW1bcHJvcGVydHldO1xyXG4gIH0pO1xyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgZGIudXBkYXRlKHBhcmFtcykucHJvbWlzZSgpO1xyXG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZTogMjA0LCBib2R5OiAnJyB9O1xyXG4gIH0gY2F0Y2ggKGRiRXJyb3IpIHtcclxuICAgIGNvbnN0IGVycm9yUmVzcG9uc2UgPSBkYkVycm9yLmNvZGUgPT09ICdWYWxpZGF0aW9uRXhjZXB0aW9uJyAmJiBkYkVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ3Jlc2VydmVkIGtleXdvcmQnKSA/XHJcbiAgICBEWU5BTU9EQl9FWEVDVVRJT05fRVJST1IgOiBSRVNFUlZFRF9SRVNQT05TRTtcclxuICAgIHJldHVybiB7IHN0YXR1c0NvZGU6IDUwMCwgYm9keTogZXJyb3JSZXNwb25zZSB9O1xyXG4gIH1cclxufTtcclxuIl19