export const NotificationTypeCode = {
  RELATION_RSVP: 'RR0',
  RELATION_RSVP_CONFIRMED: 'RR1',
  RELATION_RSVP_DENIED: 'RR2',
  RELATION_CONFIRMED: 'RC0',
  BUCKET_COMPLETED: 'BC0',
  BUCKET_ANSWER: 'BA0',
} as const;

export type NotificationType =
  typeof NotificationTypeCode[keyof typeof NotificationTypeCode];
