"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const handler = async () => {
    const params = {
        TableName: TABLE_NAME
    };
    try {
        const response = await db.scan(params).promise();
        return { statusCode: 200, body: JSON.stringify(response.Items) };
    }
    catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LWFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdldC1hbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLE1BQU0sRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM3QyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7QUFFekMsTUFBTSxPQUFPLEdBQUcsS0FBSyxJQUFvQixFQUFFO0lBRWhELE1BQU0sTUFBTSxHQUFHO1FBQ2IsU0FBUyxFQUFFLFVBQVU7S0FDdEIsQ0FBQztJQUVGLElBQUk7UUFDRixNQUFNLFFBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakQsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7S0FDbEU7SUFBQyxPQUFPLE9BQU8sRUFBRTtRQUNoQixPQUFPLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDO0tBQzFEO0FBQ0gsQ0FBQyxDQUFDO0FBWlcsUUFBQSxPQUFPLFdBWWxCIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQVdTID0gcmVxdWlyZSgnYXdzLXNkaycpO1xyXG5jb25zdCBkYiA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcclxuY29uc3QgVEFCTEVfTkFNRSA9IHByb2Nlc3MuZW52LlRBQkxFX05BTUUgfHwgJyc7XHJcblxyXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jICgpIDogUHJvbWlzZSA8YW55PiA9PiB7XHJcblxyXG4gIGNvbnN0IHBhcmFtcyA9IHtcclxuICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRVxyXG4gIH07XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGRiLnNjYW4ocGFyYW1zKS5wcm9taXNlKCk7XHJcbiAgICByZXR1cm4geyBzdGF0dXNDb2RlOiAyMDAsIGJvZHk6IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlLkl0ZW1zKSB9O1xyXG4gIH0gY2F0Y2ggKGRiRXJyb3IpIHtcclxuICAgIHJldHVybiB7IHN0YXR1c0NvZGU6IDUwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZGJFcnJvcil9O1xyXG4gIH1cclxufTtcclxuIl19