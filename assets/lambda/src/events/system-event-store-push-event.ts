export const systemEventBridgeEventSchema = {
    type: 'object',
    properties: {},
    required: ['id'],
    additionalProperties: true,
};

export interface SystemEventStorePushEvent {
    id: string;
}
