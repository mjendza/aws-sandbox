import Ajv from 'ajv';

export function validate<T>(event: any, schema: any): [T, string?] {
    const ajv = new Ajv();
    const valid = ajv.validate(schema, event);
    if (!valid) throw new Error();
    return [event as T, !valid ? ajv.errors?.join(',') : undefined];
}
