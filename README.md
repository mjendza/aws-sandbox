# my-aws-sandbox

## AWS

-   CDK
-   Lambda
-   API Gateway
-   DynamoDB

## TypeScript

-   prettier
-   eslint
-   jest

## thanks

🍺🍺🍺 for [Oskar Dudycz](https://github.com/oskardudycz) for [the template](https://github.com/oskardudycz/EventSourcing.NodeJS) to the project:

-   Github Action configuration
-   node.js configuration (prettier, eslint, tsconfig)

## Build

```bash
npm install -g aws-cdk
npm install
npm run build:ts
```

This will install the necessary CDK, then this example's dependencies, and then build your TypeScript files and your CloudFormation template.

## Deploy

$ cdk ls
<list all stacks in this program>

$ cdk synth
<generates and outputs cloudformation template>

$ cdk deploy
<deploys stack to your account>

$ cdk diff
<shows diff against deployed stack>

## Development

### CDK

#### add new resources

1. Extend the CdkResources class with new item based on the convention
1. Implement resources instance for CdkResources with new item name
1. use `generateResourceName` function to generate the resource name based on the convention

## Decisions log

| Decision               | Description                                                                                                                                                                           | Timeframe                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| :hammer: Typescript    | Typescript is awesome :heart: language for microservices (Typesafe and for small size of the repositories is maintainable). Very fast for prototyping and delivering simple solution. | 21.03.2021 [PR1](https://github.com/mjendza/aws-sandbox/pull/1) |
| :cloud: CDK            | We can define deployment with the Typescript language and forget about YAML or JSON.                                                                                                  | 21.03.2021 [PR1](https://github.com/mjendza/aws-sandbox/pull/1) |
| :cloud: github actions | I want to try github actions as build server to CI. For now we don't want to publish stack to AWS.                                                                                    | 23.03.2021 [PR3](https://github.com/mjendza/aws-sandbox/pull/3) |
| :gift: eslint          | Code can be verify for standard issues connected with JavaScript based on static analyze from eslint.                                                                                 | 23.03.2021 [PR4](https://github.com/mjendza/aws-sandbox/pull/4) |
| :gift: prettier        | We can keep same formatting.                                                                                                                                                          | 23.03.2021 [PR4](https://github.com/mjendza/aws-sandbox/pull/4) |
| :hammer: ajv           | We want to validate json schema (and **only schema** for AWS Lambada incoming event) ajv is very simple validation library                                                            | 23.03.2021 [PR4](https://github.com/mjendza/aws-sandbox/pull/4) |
| :man: manual testing   | We want to use humao.rest-client and VS code to make the HTTP requests the API GW                                                                                                     | 31.03.2021 [PR4](https://github.com/mjendza/aws-sandbox/pull/4) |
| :gift: webpack         | We want to make lambda package                                                                                                                                                        | 31.03.2021 [PR4](https://github.com/mjendza/aws-sandbox/pull/4) |
| :gift: ts-loader       | We want to use humao.rest-client and VS code to make the HTTP requests the API GW                                                                                                     | 31.03.2021 [PR4](https://github.com/mjendza/aws-sandbox/pull/4) |
