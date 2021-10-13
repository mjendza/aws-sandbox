import { Duration } from '@aws-cdk/core';

export const maximumEventAgeDuration = Duration.minutes(14);
export const maximumEventAgeInSeconds = maximumEventAgeDuration.toSeconds();
export const maximumRetryAttempts = 4;
