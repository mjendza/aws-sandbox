import {replaceWithGround} from "../cdk/cdk-helper";

test('replaceWithGround', () => {
    // WHEN
    const result = replaceWithGround("test-data-with-many-dashes")
    //THEN
    expect(result).toEqual("test_data_with_many_dashes");
});
