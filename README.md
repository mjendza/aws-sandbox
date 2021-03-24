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

Run:

```
cdk deploy
```
