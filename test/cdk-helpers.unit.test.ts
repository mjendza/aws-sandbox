import { generateResourceId } from '../cdk/helpers/cdk-helper';

test('generateResourceId', () => {
    // GIVEN
    const lambdaName = 'my-lambda-name';
    // WHEN
    const name = generateResourceId(lambdaName);
    // THEN
    expect(name).toEqual(`${lambdaName}`);
});
