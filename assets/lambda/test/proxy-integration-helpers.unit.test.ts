import {
    proxyIntegrationError,
    proxyIntegrationResult,
} from '../src/helpers/proxy-integration';
import { HttpError } from '../src/helpers/http-error';

test('proxyIntegrationResult should return body as string', () => {
    //GIVEN
    const sut = proxyIntegrationResult;
    // WHEN
    const result = sut(200, { id: 5 });
    // THEN
    expect(result).not.toBeUndefined();
});

test('proxyIntegrationError should return HttpError message as a json error field', () => {
    //GIVEN
    const sut = proxyIntegrationError;
    // WHEN
    const result = sut(new HttpError(400, 'abc'));
    // THEN
    expect(result).not.toBeUndefined();
    expect(result.body).not.toBeUndefined();
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
        error: 'abc',
    });
});

test('proxyIntegrationError should return HttpError message as a json error field', () => {
    //GIVEN
    const sut = proxyIntegrationError;
    // WHEN
    const result = sut(new TypeError('abc is undefined'));
    // THEN
    expect(result).not.toBeUndefined();
    expect(result.body).not.toBeUndefined();
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
        error: 'Internal Server error',
    });
});
