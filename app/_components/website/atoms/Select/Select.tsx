import React from 'react';
import { twMerge } from 'tailwind-merge';
import { SelectProps } from '@/website/atoms/Select/Select.types';
import { Text, Image } from '@/website/atoms';

export const Select: React.FC<SelectProps> = ({
  id,
  label,
  error,
  errorText,
  options,
  placeholder,
  className = '',
  disabled,
  ref,
  ...props
}) => {
  const baseClasses = "w-full bg-white rounded-[2px] border transition-all outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:bg-background-neutral disabled:cursor-not-allowed";

  const defaultClasses = "border-border-input text-secondary";
  const focusClasses = "focus:border-accent focus:text-accent";
  const errorClasses = error ? "!border-error-dark !text-error-dark" : "";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id}>
          <Text variant="text-xxs" className="font-normal text-text-label">
            {label}
          </Text>
        </label>
      )}

      <div className="relative w-full">
        <select
          id={id}
          ref={ref}
          disabled={disabled}
          className={twMerge(
            baseClasses,
            "h-[44px] py-[5px] px-5 pr-10", // Match Input md size
            defaultClasses,
            focusClasses,
            errorClasses,
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative w-[12px] h-[12px] -rotate-315">
            <Image
              src="/assets/website/icons/grey-down-arrow-icon.png"
              alt="Arrow"
              fill
              className="object-contain opacity-40"
            />
          </div>
        </div>
      </div>

      {(errorText && error) && (
        <Text variant="text-xxs" className="text-error-dark font-medium px-1">
          {errorText}
        </Text>
      )}
    </div>
  );
};
