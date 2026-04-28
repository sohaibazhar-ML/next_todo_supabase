"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Search, ChevronDown, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { SearchableSelectProps } from './SearchableSelect.types';
import { Text, Image, Input } from '@/website/atoms';
import { motion, AnimatePresence } from 'framer-motion';

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  name,
  label,
  error,
  errorText,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className = '',
  disabled,
  required,
  value: controlledValue,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(controlledValue || "");
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const selectedOption = useMemo(() => 
    options.find(opt => opt.value === internalValue),
    [options, internalValue]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(q) || 
      opt.value.toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  const handleSelect = (value: string) => {
    if (controlledValue === undefined) {
      setInternalValue(value);
    }
    if (onChange) {
      onChange({ target: { name, value } });
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  const triggerClasses = twMerge(
    "w-full bg-white rounded-[2px] border transition-all outline-none flex items-center text-left cursor-pointer appearance-none shadow-none",
    "h-[44px] min-h-[44px] py-[5px] px-5 pr-10",
    "text-secondary font-medium text-[14px]",
    internalValue ? "border-secondary" : "border-border-input",
    error ? "!border-error-dark" : "focus:border-accent",
    disabled && "opacity-50 bg-background-neutral cursor-not-allowed",
    isOpen && "border-accent",
    className
  );

  return (
    <div className={twMerge("flex flex-col gap-1.5 w-full", className)} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="order-1">
          <Text className="font-normal text-text-label text-[16px] leading-none">
            {label}
            {required && <span className="text-primary ml-1">*</span>}
          </Text>
        </label>
      )}

      <div className="flex flex-col gap-1.5 w-full order-2">
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
          <Popover.Trigger asChild>
            <button
              id={id}
              type="button"
              disabled={disabled}
              className={triggerClasses}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-2 flex-1 truncate">
                {selectedOption?.flag && (
                  <div className="relative w-[20px] h-[20px] flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <Image
                      src={selectedOption.flag}
                      alt=""
                      width={20}
                      height={20}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <span className={twMerge("truncate", !internalValue && "text-secondary/60 font-normal")}>
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
              </div>
              <ChevronDown 
                size={18} 
                className={twMerge(
                  "absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40 transition-transform duration-200",
                  isOpen && "rotate-180"
                )} 
              />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              side="bottom"
              align="start"
              sideOffset={4}
              className="z-[9999] bg-white border border-border-input shadow-2xl rounded-[4px] w-[var(--radix-popover-trigger-width)] max-h-[400px] overflow-hidden flex flex-col"
              onOpenAutoFocus={(e) => e.preventDefault()} // Don't focus the popover content automatically
            >
              {/* Search Bar */}
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                  <input
                    autoFocus
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-[14px] text-secondary placeholder:text-secondary/50 bg-white border border-background-neutral focus:border-primary/30 focus:ring-0 outline-none rounded-[4px] caret-primary transition-colors"
                  />
                </div>
              </div>

              {/* Options List */}
              <div className="flex-1 overflow-y-auto p-1 custom-scrollbar max-h-[300px]">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={twMerge(
                        "relative w-full flex items-center px-8 py-3 text-[14px] text-secondary rounded-[2px] transition-colors cursor-pointer outline-none text-left",
                        "hover:bg-background-neutral hover:text-primary",
                        internalValue === option.value && "bg-primary/5 text-primary font-semibold"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {option.flag && (
                          <div className="relative w-[20px] h-[20px] flex-shrink-0 flex items-center justify-center overflow-hidden">
                            <Image
                              src={option.flag}
                              alt=""
                              width={20}
                              height={20}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <span>{option.label}</span>
                      </div>

                      {internalValue === option.value && (
                        <div className="absolute left-3 inline-flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="py-8 px-4 text-center">
                    <Text variant="text-xxs" className="text-secondary/40 italic">
                      {emptyMessage}
                    </Text>
                  </div>
                )}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {name && <input type="hidden" name={name} value={internalValue} />}

        {(errorText && error) && (
          <Text variant="text-xxs" className="text-error-dark font-medium px-1 text-[11px]">
            {errorText}
          </Text>
        )}
      </div>
    </div>
  );
};
