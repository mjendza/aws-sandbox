import { IQueue } from '@aws-cdk/aws-sqs';

export function alarmEachMessage(queue: IQueue) {
    // DLQAlarm:
    //     Type: AWS::CloudWatch::Alarm
    // Properties:
    //     AlarmDescription: "SQS failed"
    // AlarmName: "SQSAlarm"
    // Metrics:
    //     - Expression: "m2-m1"
    // Id: "e1"
    // Label: "ChangeInAmountVisible"
    // ReturnData: true
    // - Id: "m1"
    // Label: "MessagesVisibleMin"
    // MetricStat:
    //     Metric:
    //         Dimensions:
    //             - Name: QueueName
    // Value: !GetAtt DLQ.QueueName
    // MetricName: ApproximateNumberOfMessagesVisible
    // Namespace: "AWS/SQS"
    // Period: 300 # evaluate maximum over period of 5 min
    // Stat: Minimum
    // Unit: Count
    // ReturnData: false
    // - Id: "m2"
    // Label: "MessagesVisibleMax"
    // MetricStat:
    //     Metric:
    //         Dimensions:
    //             - Name: QueueName
    // Value: !GetAtt DLQ.QueueName
    // MetricName: ApproximateNumberOfMessagesVisible
    // Namespace: "AWS/SQS"
    // Period: 300 # evaluate maximum over period of 5 min
    // Stat: Maximum
    // Unit: Count
    // ReturnData: false
    // ComparisonOperator: GreaterThanOrEqualToThreshold
    // Threshold: 1
    // DatapointsToAlarm: 1
    // EvaluationPeriods: 1
}
