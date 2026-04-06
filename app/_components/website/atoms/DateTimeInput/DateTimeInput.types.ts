import { LucideIcon } from 'lucide-react';

export interface DateTimeInputProps {
  id: string;
  name?: string;
  label?: string;
  labelClassName?: string;
  placeholder?: string;
  value?: string; // Formatted date string or ISO string
  error?: boolean;
  errorText?: string;
  helperText?: string;
  className?: string;
  inputClassName?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  leftIcon?: LucideIcon;
  layout?: 'vertical' | 'horizontal';
}
