/**
 * SendGrid Template Configuration
 * Maps logical template keys to their SendGrid Dynamic Template IDs
 */
export const SENDGRID_TEMPLATES = {
  CALLBACK_REQUEST: 'd-3a9b76c3ddff49a48c55f29afab6e47d',
  // Future templates can be added here
} as const;

export type SendGridTemplateKey = keyof typeof SENDGRID_TEMPLATES;
