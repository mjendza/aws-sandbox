//import Ajv from 'ajv';

export function validate<T>(event: any, schema: any): T {
    // const ajv = new Ajv();
    // const valid = ajv.validate(schema, event);
    // if (!valid) throw new HttpError(400, ajv.errors?.join(','));
    return event as T;
}

// export class HttpError extends Error {
//     constructor(code: number, message?: string) {
//         super(message);
//         this.statusCode = code;
//         this.message = message ?? '';
//     }
//     statusCode: number;
// }
