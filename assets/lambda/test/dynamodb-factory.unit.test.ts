import { dynamoClient } from '../src/helpers/dynamodb-factory';

test('dynamodb-factory dynamoClient creation with x-ray', () => {
    //GIVEN
    process.env.AWS_REGION = 'eu-central-1';
    // WHEN
    const result = dynamoClient();
    // THEN
    expect(result).not.toBeUndefined();
});
