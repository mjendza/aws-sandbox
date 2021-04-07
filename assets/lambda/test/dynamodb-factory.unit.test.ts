import { dynamoClient } from '../src/helpers/dynamodb-factory';

test('dynamodb-factory dynamoClient creation with x-ray', () => {
    //GIVEN // WHEN
    const result = dynamoClient();
    // THEN
    expect(result).not.toBeUndefined();
});
