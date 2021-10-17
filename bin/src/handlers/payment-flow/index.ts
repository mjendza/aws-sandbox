import { Callback, Context } from 'aws-lambda';

export function handler(event: any, context: Context, callback: Callback<any>) {
    callback(
        new Error('temporary issue, check the lumigo and SQS DLQ for error!'),
        null
    );
}
