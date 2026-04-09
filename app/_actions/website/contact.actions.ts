"use server";

import { contactSchema } from '@/schemas/website/contact.schema';
import { sendGridService } from '@/services/website/email-service/sendgrid.service';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Server action to handle the footer callback contact form
 */
export async function submitContactAction(formData: {
  footer_name: string;
  footer_phone: string;
  footer_time: string;
  locale?: string;
}) {
  try {
    // 1. Validate the input data
    const validated = contactSchema.parse(formData);

    // 2. Format the date into a readable string
    let formattedTime = validated.footer_time;
    try {
      if (validated.footer_time) {
        const date = new Date(validated.footer_time);
        formattedTime = format(date, 'eeee, d. MMMM, HH:mm', { 
           locale: de // Defaulting to German as per project context, can be adjusted
        });
      }
    } catch (e) {
      console.warn('Failed to format date:', validated.footer_time);
    }

    // 3. Prepare the email recipient
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL;
    if (!receiverEmail) {
      throw new Error('CONTACT_RECEIVER_EMAIL is not configured');
    }

    // 4. Send the email via SendGrid
    const result = await sendGridService.sendTemplateEmail({
      to: receiverEmail,
      templateKey: 'CALLBACK_REQUEST',
      dynamicTemplateData: {
        name: validated.footer_name,
        phone: validated.footer_phone,
        preferred_time: formattedTime,
        request_locale: formData.locale || 'de',
        request_timestamp: new Date().toISOString(),
      },
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Contact Form Error:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred. Please try again later.' 
    };
  }
}
