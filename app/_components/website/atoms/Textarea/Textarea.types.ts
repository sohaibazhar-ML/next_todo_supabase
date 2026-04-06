import { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: boolean;
  errorText?: string;
  helperText?: string;
  inputSize?: 'sm' | 'md';
  className?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
}
