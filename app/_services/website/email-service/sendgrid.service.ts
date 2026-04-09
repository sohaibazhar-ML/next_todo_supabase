import sgMail from '@sendgrid/mail';
import { SendGridTemplateKey, SENDGRID_TEMPLATES } from '@/website/constants';
import { SendEmailParams } from '@/app/_types/website/email.types';

/**
 * Service for sending template-based emails via SendGrid
 */
export class SendGridService {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('SENDGRID_API_KEY is not defined in environment variables');
    } else {
      sgMail.setApiKey(apiKey);
    }
  }

  /**
   * Sends an email using a dynamic SendGrid template
   */
  async sendTemplateEmail<K extends SendGridTemplateKey>({
    to,
    templateKey,
    dynamicTemplateData,
    from,
  }: SendEmailParams<K>) {
    const templateId = SENDGRID_TEMPLATES[templateKey];
    const fromEmail = from || process.env.SENDGRID_FROM_EMAIL;

    if (!fromEmail) {
      throw new Error('No sender email defined. Set SENDGRID_FROM_EMAIL or provide a from address.');
    }

    const msg = {
      to,
      from: fromEmail,
      templateId,
      dynamicTemplateData,
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error: any) {
      console.error('SendGrid Error:', error.response?.body || error.message);
      return { 
        success: false, 
        error: error.message || 'Failed to send email' 
      };
    }
  }
}

// Export a single instance
export const sendGridService = new SendGridService();
