import React from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: boolean;
  errorText?: string;
  options: SelectOption[];
  placeholder?: string;
  ref?: React.Ref<HTMLSelectElement>;
}
