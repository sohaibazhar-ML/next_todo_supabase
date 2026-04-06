import { InputProps } from '../Input/Input.types';

export interface CheckboxProps extends Omit<InputProps, 'type' | 'layout'> {
  label?: string;
  error?: boolean;
  errorText?: string;
}
