import React from 'react';
import { twMerge } from 'tailwind-merge';
import { CheckboxProps } from '@/website/atoms/Checkbox/Checkbox.types';
import { Input } from '@/website/atoms';

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  error,
  errorText,
  className = '',
  ref,
  ...props
}) => {
  return (
    <Input
      id={id}
      type="checkbox"
      ref={ref}
      label={label}
      error={error}
      errorText={errorText}
      layout="horizontal"
      className={twMerge("w-fit", className)}
      inputClassName={twMerge(
        "w-5 h-5 rounded-[2px] border transition-all outline-none cursor-pointer appearance-none bg-white",
        "checked:bg-[url('/assets/website/icons/checkmark.svg')] checked:bg-center checked:bg-no-repeat",
        "checked:bg-[length:12px_12px]"
      )}
      {...props}
    />
  );
};
