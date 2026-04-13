import { ReactNode } from 'react';

export interface FormMessageProps {
  /**
   * The variant of the message.
   */
  variant: 'success' | 'error';
  
  /**
   * The message content to be displayed.
   */
  message: string | ReactNode;
  
  /**
   * Optional CSS class for the container.
   */
  className?: string;
}
