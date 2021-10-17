import AWS from 'aws-sdk';

export class ConfigurationManager {
    async getKey(keyNames: string[]): Promise<string> {
        if (keyNames.length > 1) {
            throw new Error('Alpha version can handle only one item!');
        }
        const params: AWS.SSM.Types.GetParametersRequest = {
            Names: keyNames,
            WithDecryption: true,
        };

        const ssm = this.createSsm();
        const result = await ssm.getParameters(params).promise();
        if (!result.Parameters) {
            throw new Error('Parameters are empty.');
        }
        const itemValue = result.Parameters[0].Value;
        if (!itemValue) {
            throw new Error(`For the keys ${keyNames} there are no values.`);
        }
        return itemValue;
    }

    private createSsm(): AWS.SSM {
        const fromEnv = process.env['AWS_REGION'] || 'eu-central-1';
        const options: AWS.SSM.Types.ClientConfiguration = {
            region: fromEnv,
        };
        return new AWS.SSM(options);
    }
}
