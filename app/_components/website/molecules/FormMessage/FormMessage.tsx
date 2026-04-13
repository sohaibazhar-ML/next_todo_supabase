import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { FormMessageProps } from './FormMessage.types';

export const FormMessage: React.FC<FormMessageProps> = ({ 
  variant, 
  message, 
  className = '' 
}) => {
  const isSuccess = variant === 'success';

  return (
    <div 
      className={`
        w-full min-h-[48px] flex items-center gap-2 px-6 py-[13px] border rounded-[4px] shadow-sm
        animate-in fade-in slide-in-from-top-2 duration-300
        ${isSuccess 
          ? 'bg-success-light border-success-border' 
          : 'bg-primary-light border-primary'
        }
        ${className}
      `}
    >
      <CheckCircle2 
        size={20} 
        className={`shrink-0 ${isSuccess ? 'text-success' : 'text-primary'}`} 
      />
      <span 
        className={`
          text-[16px] font-normal leading-tight
          ${isSuccess ? 'text-secondary' : 'text-primary'}
        `}
      >
        {message}
      </span>
    </div>
  );
};
