import {generateResourceId} from "../cdk/cdk-helper";

test('generateResourceId', () => {
    // GIVEN
    const lambdaName = "my-lambda-name";
    // WHEN
    const name = generateResourceId(lambdaName);
    // THEN
    expect(name).toEqual(`${lambdaName}`);
});
