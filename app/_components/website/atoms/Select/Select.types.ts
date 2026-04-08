import React from 'react';

export interface SelectOption {
  label: string;
  value: string;
  flag?: string;
}

export interface SelectProps {
  id: string;
  name?: string;
  label?: string;
  error?: boolean;
  errorText?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}
