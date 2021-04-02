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
});
