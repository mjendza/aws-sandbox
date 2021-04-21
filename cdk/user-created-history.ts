// import {Bucket, BucketEncryption} from "@aws-cdk/aws-s3";
// import {Code, Runtime, Tracing} from "@aws-cdk/aws-lambda";
// import {AttributeType, BillingMode, Table} from "@aws-cdk/aws-dynamodb";
// import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";
// import {JsonPath, StateMachine} from "@aws-cdk/aws-stepfunctions";
// import {Topic} from "@aws-cdk/aws-sns";
// import {EventBus, Rule} from "@aws-cdk/aws-events";
// import * as targets from "@aws-cdk/aws-events-targets";
// import {Construct} from "@aws-cdk/core";
//
// export function handleUserCreated(construct: Construct, bus: EventBus){
//     // s3 bucket
//     const bucket = new Bucket(construct, 'AuditEventsRaw', {
//         encryption: BucketEncryption.KMS_MANAGED
//     });
//
//     // lambda function
//     const saveToS3Fn = new Function(construct, 'SaveToS3Fn', {
//         functionName: `${prefix}-save-to-s3`,
//         runtime: Runtime.NODEJS_12_X,
//         handler: 'index.handler',
//         code: Code.fromAsset('./lib/lambda/save-to-s3'),
//         environment: {
//             BUCKET_NAME: bucket.bucketName
//         },
//         tracing: Tracing.ACTIVE
//     });
//
//     bucket.grantWrite(saveToS3Fn);
//
//     // dynamodb table
//     const table = new Table(construct, 'AuditEventTable', {
//         tableName: `${prefix}-audit-events`,
//         partitionKey: {name: 'EventId', type: AttributeType.STRING},
//         billingMode: BillingMode.PAY_PER_REQUEST
//     });
//
//     table.addGlobalSecondaryIndex({
//         indexName: 'search-by-entity-id',
//         partitionKey: {name: 'EntityId', type: AttributeType.STRING},
//         sortKey: {name: 'Ts', type: AttributeType.NUMBER}
//     });
//
//     table.addGlobalSecondaryIndex({
//         indexName: 'search-by-author',
//         partitionKey: {name: 'Author', type: AttributeType.STRING},
//         sortKey: {name: 'Ts', type: AttributeType.NUMBER}
//     });
//
//     // state machine
//     const saveToS3Job = new tasks.LambdaInvoke(construct, 'SaveToS3', {
//         lambdaFunction: saveToS3Fn,
//         payloadResponseOnly: true,
//         resultPath: '$.detail.s3Key'
//     });
//
//     const saveToDbJob = new tasks.DynamoPutItem(construct, 'SaveToDb', {
//         item: {
//             EventId: tasks.DynamoAttributeValue.fromString(JsonPath.stringAt('$.id')),
//             EntityType: tasks.DynamoAttributeValue.fromString(JsonPath.stringAt('$.detail[\'entity-type\']')),
//             EntityId: tasks.DynamoAttributeValue.fromString(JsonPath.stringAt('$.detail[\'entity-id\']')),
//             Operation: tasks.DynamoAttributeValue.fromString(JsonPath.stringAt('$.detail.operation')),
//             S3Key: tasks.DynamoAttributeValue.fromString(JsonPath.stringAt('$.detail.s3Key')),
//             Author: tasks.DynamoAttributeValue.fromString(JsonPath.stringAt('$.detail.author')),
//             Ts: tasks.DynamoAttributeValue.numberFromString(JsonPath.stringAt('$.detail.ts'))
//         },
//         table:  table
//     });
//
//     const definition = saveToS3Job.next(saveToDbJob);
//
//     const stateMachine = new StateMachine(construct, 'LogAuditEvent', {
//         definition,
//         stateMachineName: `${prefix}-log-audit-event`
//     });
//
//     // rule with step function state machine as a target
//     const auditEventsRule = new Rule(construct, 'AuditEventsBusRule', {
//         ruleName: `${prefix}-system-events-rule`,
//         description: 'Rule matching audit events',
//         eventBus: bus,
//         eventPattern: {
//             detailType: ['Object State Change']
//         }
//     });
//
//     auditEventsRule.addTarget(new targets.SfnStateMachine(stateMachine));
// }
//
// export function handleUserDeleted(construct: Construct){
//     / rule for deleted entities
//     const deletedEntitiesRule = new Rule(construct, 'DeletedEntitiesBusRule', {
//         ruleName: `${prefix}-deleted-entities-rule`,
//         description: 'Rule matching audit events for delete operations',
//         eventBus: bus,
//         eventPattern: {
//             detailType: ['Object State Change'],
//             detail: {
//                 operation: ['delete']
//             }
//         }
//     });
//
//     deletedEntitiesRule.addTarget(new targets.SnsTopic(topic, {
//         message: RuleTargetInput.fromText(
//             `Entity with id ${EventField.fromPath('$.detail.entity-id')} has been deleted by ${EventField.fromPath('$.detail.author')}`
//         )
//     }));
// }