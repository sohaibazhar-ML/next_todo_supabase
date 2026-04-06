import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { TextareaProps } from '@/website/atoms/Textarea/Textarea.types';
import { Text } from '@/website/atoms/Typography/Text';

export const Textarea: React.FC<TextareaProps> = ({
  id,
  label,
  error,
  errorText,
  helperText,
  inputSize = 'md',
  className = '',
  placeholder = " ",
  disabled,
  ref,
  rows = 4,
  ...props
}) => {
  const sizeClasses = {
    sm: "py-2 px-3 text-[14px]",
    md: "py-3 px-4",
  };

  const baseClasses = "w-full bg-white rounded-[2px] border transition-all outline-none disabled:opacity-50 disabled:bg-background-neutral disabled:cursor-not-allowed resize-y";

  // State-specific classes
  const defaultClasses = "border-border-input text-secondary placeholder:text-input-placeholder";
  const focusClasses = "focus:border-accent focus:text-accent";
  const filledClasses = "[&:not(:placeholder-shown)]:border-secondary [&:not(:placeholder-shown)]:text-secondary";
  const errorClasses = error ? "!border-error-dark !text-error-dark" : "";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id}>
          <Text variant="text-xxs" className="font-medium text-secondary/70">
            {label}
          </Text>
        </label>
      )}

      <div className="relative w-full">
        <textarea
          id={id}
          ref={ref}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className={twMerge(
            clsx(
              baseClasses,
              sizeClasses[inputSize],
              defaultClasses,
              focusClasses,
              filledClasses,
              errorClasses,
              className
            )
          )}
          {...props}
        />
      </div>

      {(errorText && error) && (
        <Text variant="text-xxs" className="text-error-dark font-medium px-1">
          {errorText}
        </Text>
      )}

      {helperText && !error && (
        <Text variant="text-xxs" className="text-secondary/50 px-1">
          {helperText}
        </Text>
      )}
    </div>
  );
};
