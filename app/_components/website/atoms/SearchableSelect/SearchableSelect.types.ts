import { SelectOption } from '@/website/atoms/Select/Select.types';

export interface SearchableSelectProps {
  id?: string;
  name?: string;
  label?: string;
  autoFocus?: boolean;
  error?: boolean;
  errorText?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
}
