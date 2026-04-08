"use client";

import React, { useState, useEffect } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { twMerge } from 'tailwind-merge';
import { SelectProps, SelectOption } from '@/website/atoms/Select/Select.types';
import { Text } from '@/website/atoms';

export const Select: React.FC<SelectProps> = ({
  id,
  name,
  label,
  error,
  errorText,
  options,
  placeholder = "Select an option",
  className = '',
  disabled,
  required,
  value: controlledValue,
  onChange,
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || "");

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const selectedOption = options.find(opt => opt.value === internalValue);

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    if (onChange) {
      onChange({ target: { name, value: newValue } });
    }
  };

  const triggerClasses = twMerge(
    "w-full bg-white rounded-[2px] border transition-all outline-none flex items-center text-left cursor-pointer appearance-none shadow-none",
    "h-[44px] min-h-[44px] py-[5px] px-5 pr-10",
    "text-secondary font-medium text-[14px]", // Default text style
    "[& > span]:truncate [& > span]:leading-none", // Ensure inner span is styled
    "data-[placeholder]:text-secondary/60 data-[placeholder]:font-normal", // Placeholder styling via Radix attributes
    internalValue ? "border-secondary" : "border-border-input",
    error ? "!border-error-dark" : "focus:border-accent data-[state=open]:border-accent",
    disabled && "opacity-50 bg-background-neutral cursor-not-allowed",
    className
  );

  return (
    <div className={twMerge("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label htmlFor={id} className="order-1">
          <Text className="font-normal text-text-label text-[16px] leading-none">
            {label}
            {required && <span className="text-primary ml-1">*</span>}
          </Text>
        </label>
      )}

      <div className="flex flex-col gap-1.5 w-full order-2">
        <div className="relative w-full group">
          <SelectPrimitive.Root
            value={internalValue}
            onValueChange={handleValueChange}
            disabled={disabled}
          >
            <SelectPrimitive.Trigger id={id} className={triggerClasses}>
              <div className="flex items-center gap-2 flex-1 truncate pointer-events-none">
                {selectedOption?.flag && (
                  <div className="relative w-[22px] h-[15px] flex-shrink-0 shadow-sm overflow-hidden rounded-[1px]">
                    <img
                      src={selectedOption.flag}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <SelectPrimitive.Value placeholder={placeholder} />
              </div>

              <SelectPrimitive.Icon className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-data-[state=open]:rotate-180 transition-transform duration-200">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#362E2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>

            <SelectPrimitive.Portal>
              <SelectPrimitive.Content
                position="popper"
                sideOffset={4}
                className="z-[9999] bg-white border border-border-input shadow-2xl rounded-[4px] w-[var(--radix-select-trigger-width)] max-h-[300px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              >
                <SelectPrimitive.Viewport className="p-1">
                  {options.map((option) => (
                    <SelectPrimitive.Item
                      key={option.value}
                      value={option.value}
                      className={twMerge(
                        "relative flex items-center px-8 py-3 text-[14px] text-secondary rounded-[2px] transition-colors cursor-pointer outline-none",
                        "focus:bg-background-neutral focus:text-primary",
                        "data-[state=checked]:bg-primary/5 data-[state=checked]:text-primary data-[state=checked]:font-semibold"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {option.flag && (
                          <div className="relative w-[22px] h-[15px] flex-shrink-0 shadow-sm overflow-hidden rounded-[1px]">
                            <img
                              src={option.flag}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <SelectPrimitive.ItemText>
                          {option.label}
                        </SelectPrimitive.ItemText>
                      </div>

                      <SelectPrimitive.ItemIndicator className="absolute left-3 inline-flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Viewport>
              </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
          </SelectPrimitive.Root>

          {name && <input type="hidden" name={name} value={internalValue} />}
        </div>

        {(errorText && error) && (
          <Text variant="text-xxs" className="text-error-dark font-medium px-1 text-[11px]">
            {errorText}
          </Text>
        )}
      </div>
      
      <style jsx>{`
        button::-ms-expand {
          display: none;
        }
        button {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
      `}</style>
    </div>
  );
};
