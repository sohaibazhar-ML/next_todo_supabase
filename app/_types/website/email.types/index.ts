import { SendGridTemplateKey } from '@/website/constants';

/**
 * Data structure for the Footer Callback Request template
 */
export interface CallbackTemplateData {
  name: string;
  phone: string;
  preferred_time: string;
  // Metadata for internal tracking
  request_locale: string;
  request_timestamp: string;
}

/**
 * Data structure for Auth Confirmation template
 */
export interface AuthConfirmationData {
  user: string;
  link: string;
  homepagelink: string;
  dataprotectionlink: string;
  impressumlink: string;
}

/**
 * Data structure for Password Reset template
 */
export interface PasswordResetData {
  user: string;
  link: string;
  homepagelink: string;
  dataprotectionlink: string;
  impressumlink: string;
}

/**
 * Registry of all dynamic template data types
 */
export interface EmailTemplateDataMap {
  CALLBACK_REQUEST: CallbackTemplateData;
  AUTH_CONFIRMATION: AuthConfirmationData;
  PASSWORD_RESET: PasswordResetData;
}

/**
 * Payload for sending a generic template-based email
 */
export interface SendEmailParams<K extends SendGridTemplateKey> {
  to: string;
  templateKey: K;
  dynamicTemplateData: EmailTemplateDataMap[K];
  from?: string; // Optional override
}
