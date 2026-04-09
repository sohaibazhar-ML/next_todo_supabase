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
 * Registry of all dynamic template data types
 */
export interface EmailTemplateDataMap {
  CALLBACK_REQUEST: CallbackTemplateData;
  // Add future template data interfaces here
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
