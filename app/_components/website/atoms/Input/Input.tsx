import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { InputProps } from '@/website/atoms/Input/Input.types';
import { Text } from '@/website/atoms/Typography/Text';

export const Input: React.FC<InputProps> = ({
  id,
  label,
  labelClassName = '',
  error,
  errorText,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  inputSize = 'md',
  className = '',
  inputClassName = '',
  placeholder = " ",
  disabled,
  type,
  layout = 'vertical',
  ref,
  ...props
}) => {
  const isCheckbox = type === 'checkbox';

  const sizeClasses = {
    sm: "h-[34px] min-h-[34px] py-1 px-3 text-[14px]",
    md: "h-[44px] min-h-[44px] px-4",
  };

  const baseClasses = isCheckbox 
    ? "rounded-[2px] border transition-all outline-none cursor-pointer appearance-none bg-white flex-shrink-0"
    : "w-full bg-white rounded-[2px] border transition-all outline-none disabled:opacity-50 disabled:bg-background-neutral disabled:cursor-not-allowed";

  // State-specific classes
  const defaultClasses = isCheckbox
    ? "border-border-input hover:border-accent checked:bg-primary checked:border-primary"
    : "border-border-input text-secondary placeholder:text-input-placeholder";
    
  const focusClasses = !isCheckbox ? "focus:border-accent focus:text-accent" : "";
  const filledClasses = (!isCheckbox && type !== 'number') ? "[&:not(:placeholder-shown)]:border-secondary [&:not(:placeholder-shown)]:text-secondary" : "";
  const errorClasses = error ? "!border-error-dark !text-error-dark" : "";

  const content = (
    <div className="relative flex-1">
      {LeftIcon && !isCheckbox && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40">
          <LeftIcon size={inputSize === 'sm' ? 16 : 18} />
        </div>
      )}
      <input
        id={id}
        ref={ref}
        disabled={disabled}
        placeholder={placeholder}
        type={type}
        className={twMerge(
          clsx(
            baseClasses,
            !isCheckbox && sizeClasses[inputSize],
            defaultClasses,
            focusClasses,
            filledClasses,
            errorClasses,
            LeftIcon && !isCheckbox && "pl-10",
            RightIcon && !isCheckbox && "pr-10",
            inputClassName
          )
        )}
        {...props}
      />
      {RightIcon && !isCheckbox && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40">
          <RightIcon size={inputSize === 'sm' ? 16 : 18} />
        </div>
      )}
    </div>
  );

  return (
    <div className={twMerge(
      "flex w-full",
      layout === 'vertical' ? "flex-col gap-1.5" : "flex-row items-center gap-3",
      className
    )}>
      {label && (
        <label htmlFor={id} className={twMerge(
          isCheckbox ? "cursor-pointer select-none order-2" : "order-1",
          labelClassName
        )}>
          <Text variant="text-xxs" className="font-medium text-secondary/70 leading-none">
            {label}
          </Text>
        </label>
      )}

      <div className={twMerge(
        "flex flex-col gap-1.5",
        layout === 'vertical' ? "w-full order-2" : "order-1"
      )}>
        {content}

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
    </div>
  );
};
