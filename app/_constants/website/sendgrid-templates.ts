/**
 * SendGrid Template Configuration
 * Maps logical template keys to their SendGrid Dynamic Template IDs
 */
export const SENDGRID_TEMPLATES = {
  CALLBACK_REQUEST: 'd-3a9b76c3ddff49a48c55f29afab6e47d',
  AUTH_CONFIRMATION: 'd-ba52c17134dd442181d0252a9b994080',
  PASSWORD_RESET: 'REPLACE_WITH_YOUR_RESET_TEMPLATE_ID',
} as const;

export type SendGridTemplateKey = keyof typeof SENDGRID_TEMPLATES;
