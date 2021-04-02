# my-aws-sandbox

## TD/TR

This is my sandbox AWS Serverless stack.

## Diagram

`TODO`

## Limitations

This is single repository stack. In one place and as single CDK deployment we are creating all is needed to deliver working application.

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

#### enable traceability for each resource:

-   for RestApi
-   for lambda please use `lambdaFactory` helper to generate CDK lambda with all needed setup

## Decisions log

use the github [markdown emoji markup](https://gist.github.com/rxaviers/7360908) to show type for decision

| Emoji    | Short description      |
| -------- | ---------------------- |
| :cloud:  | Deployment             |
| :gift:   | Development            |
| :hammer: | Architecture decisions |

| Decision               | Description                                                                                                                                                                           | Timeframe                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| :hammer: Typescript    | Typescript is awesome :heart: language for microservices (Typesafe and for small size of the repositories is maintainable). Very fast for prototyping and delivering simple solution. | 21.03.2021 [PR1](https://github.com/mjendza/aws-sandbox/pull/1)   |
| :cloud: CDK            | We can define deployment with the Typescript language and forget about YAML or JSON.                                                                                                  | 21.03.2021 [PR1](https://github.com/mjendza/aws-sandbox/pull/1)   |
| :cloud: github actions | I want to try github actions as build server to CI. For now we don't want to publish stack to AWS.                                                                                    | 23.03.2021 [PR3](https://github.com/mjendza/aws-sandbox/pull/3)   |
| :gift: eslint          | Code can be verify for standard issues connected with JavaScript based on static analyze from eslint.                                                                                 | 23.03.2021 [PR4](https://github.com/mjendza/aws-sandbox/pull/4)   |
| :gift: prettier        | We can keep same formatting.                                                                                                                                                          | 23.03.2021 [PR4](https://github.com/mjendza/aws-sandbox/pull/4)   |
| :hammer: ajv           | We want to validate json schema (and **only schema** for AWS Lambada incoming event) ajv is very simple validation library                                                            | 23.03.2021 [PR7](https://github.com/mjendza/aws-sandbox/pull/7)   |
| :man: manual testing   | We want to use humao.rest-client and VS code to make the HTTP requests the API GW                                                                                                     | 31.03.2021 [PR7](https://github.com/mjendza/aws-sandbox/pull/7)   |
| :gift: webpack         | We want to publish lambda Typescript code as JavaScript with webpack                                                                                                                  | 31.03.2021 [PR11](https://github.com/mjendza/aws-sandbox/pull/11) |
| :gift: ts-loader       | To load dependencies we want to use ts-loaded based on [examples](https://github.com/TypeStrong/ts-loader/tree/main/examples)                                                         | 31.03.2021 [PR11](https://github.com/mjendza/aws-sandbox/pull/11) |
| :cloud: X-RAY          | We want to see the trace for each action in the system. The best option is to use AWS X-RAY.                                                                                          | 21.03.2021 [PR1](https://github.com/mjendza/aws-sandbox/pull/1)   |
