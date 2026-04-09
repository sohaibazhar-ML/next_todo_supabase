"use client";

import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import * as Popover from '@radix-ui/react-popover';
import { format, isValid, startOfDay, addMinutes, isBefore } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { DateTimeInputProps } from './DateTimeInput.types';
import { Text } from '@/website/atoms/Typography/Text';
import { Button } from '@/website/atoms/Button/Button';
import { Image } from '@/website/atoms/Image/Image';
import { useLocale, useTranslations } from 'next-intl';

const locales: Record<string, any> = { de, en: enUS, fr, it };

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  id,
  name,
  label,
  labelClassName = '',
  placeholder = "Select date and time",
  value = "",
  error,
  errorText,
  helperText,
  className = '',
  inputClassName = '',
  onChange,
  disabled,
  minDate,
  maxDate,
  leftIcon: LeftIcon = CalendarIcon,
  layout = 'vertical',
  required,
}) => {
  const currentLocale = useLocale();
  const t = useTranslations('DateTimeInput');
  const dateLocale = locales[currentLocale] || enUS;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    value ? format(new Date(value), 'HH:mm') : undefined
  );
  const [finalValue, setFinalValue] = useState<string>(value || "");

  // Sync internal state with prop value
  useEffect(() => {
    if (value && isValid(new Date(value))) {
      const date = new Date(value);
      setSelectedDate(date);
      setSelectedTime(format(date, 'HH:mm'));
      setFinalValue(value);
    } else if (value === "" || value === undefined || value === null) {
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setFinalValue("");
    }
  }, [value]);

  const generateTimeSlots = () => {
    const slots = [];
    let current = startOfDay(new Date());
    const end = addMinutes(current, 24 * 60);

    while (isBefore(current, end)) {
      slots.push(format(current, 'HH:mm'));
      current = addMinutes(current, 30);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const finalDate = new Date(selectedDate);
      finalDate.setHours(hours, minutes, 0, 0);

      const isoString = finalDate.toISOString();
      setFinalValue(isoString);
      onChange?.(isoString);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (!selectedDate || !selectedTime || !isValid(selectedDate)) return "";
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const date = new Date(selectedDate);
    date.setHours(hours, minutes);
    return format(date, 'eeee, MMM d, HH:mm', { locale: dateLocale });
  };

  const displayValue = getDisplayValue();

  return (
    <div className={twMerge("flex w-full", layout === 'vertical' ? "flex-col gap-1.5" : "flex-row items-center gap-3", className)}>
      {label && (
        <label htmlFor={id} className={twMerge("order-1", labelClassName)}>
          <Text className="font-normal text-text-label text-[16px] leading-none">
            {label}
            {required && <span className="text-primary ml-1">*</span>}
          </Text>
        </label>
      )}

      <div className={twMerge("flex flex-col gap-1.5 relative", layout === 'vertical' ? "w-full order-2" : "order-1")}>
        <input type="hidden" name={name} value={finalValue} />
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
          <Popover.Trigger asChild>
            <button
              id={id}
              type="button"
              disabled={disabled}
              className={twMerge(
                clsx(
                  "w-full bg-white rounded-[2px] border transition-all outline-none flex items-center text-left cursor-pointer",
                  "h-[44px] min-h-[44px] py-[5px] px-5",
                  isOpen ? "border-accent" : (displayValue ? "border-secondary" : "border-border-input"),
                  error ? "!border-error-dark" : "",
                  disabled && "opacity-50 bg-background-neutral cursor-not-allowed",
                  inputClassName
                )
              )}
            >
              {LeftIcon && <LeftIcon className={twMerge("mr-2 sm:mr-3 text-secondary/40", "w-4 h-4 sm:w-[18px] sm:h-[18px]")} />}
              <Text 
                variant="text-xs" 
                className={twMerge(
                  "flex-1 truncate",
                  displayValue ? "text-secondary" : "text-input-placeholder"
                )}
              >
                {displayValue || placeholder}
              </Text>
              {!disabled && displayValue && (
                <X
                  size={12}
                  className="ml-2 hover:text-error-dark transition-colors flex-shrink-0 cursor-pointer text-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(undefined);
                    setSelectedTime(undefined);
                    setFinalValue("");
                    onChange?.("");
                  }}
                />
              )}
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={4}
              className={twMerge(
                "z-50 bg-white border border-border-input shadow-xl rounded-lg p-0 flex flex-col md:flex-row overflow-hidden",
                "animate-in fade-in zoom-in-95 duration-200",
                "max-h-[85vh] overflow-y-auto w-[calc(100vw-40px)] md:w-auto md:max-w-[450px]"
              )}
            >
              {/* Calendar Section */}
              <div className="p-2 sm:p-3 border-b md:border-b-0 md:border-r border-border-input flex-shrink-0 flex justify-center bg-white">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleSelectDate}
                  disabled={{ before: minDate || new Date() }}
                  locale={dateLocale}
                  className="m-0"
                  classNames={{
                    month: "space-y-2 sm:space-y-3",
                    month_caption: "flex justify-center pt-0.5 relative items-center mb-1 sm:mb-2 px-10",
                    caption_label: "text-[12px] sm:text-[13px] font-bold text-secondary",
                    nav: "flex items-center",
                    button_previous: twMerge(
                      "h-6 w-6 sm:h-7 sm:w-7 bg-transparent p-0 opacity-40 hover:opacity-100 flex items-center justify-center transition-all absolute left-0.5 outline-none border-none shadow-none cursor-pointer",
                      "text-secondary"
                    ),
                    button_next: twMerge(
                      "h-6 w-6 sm:h-7 sm:w-7 bg-transparent p-0 opacity-40 hover:opacity-100 flex items-center justify-center transition-all absolute right-0.5 outline-none border-none shadow-none cursor-pointer",
                      "text-secondary"
                    ),
                    month_grid: "w-full border-collapse space-y-0.5",
                    weekdays: "flex",
                    weekday: "text-secondary/50 rounded-md w-7 sm:w-8 font-medium text-[10px] sm:text-[11px] uppercase mb-1 text-center",
                    week: "flex w-full mt-0.5",
                    day: "h-7 w-7 sm:h-8 sm:w-8 text-center p-0 relative focus-within:relative focus-within:z-20",
                    day_button: twMerge(
                      "h-7 w-7 sm:h-8 sm:w-8 p-0 font-normal text-[11px] sm:text-[12px] aria-selected:opacity-100 rounded-[4px] transition-colors flex items-center justify-center w-full cursor-pointer",
                      "text-secondary hover:bg-background-neutral",
                      "aria-selected:bg-primary/10 aria-selected:!text-primary aria-selected:font-bold aria-selected:hover:bg-primary/10"
                    ),
                    selected: "bg-primary/10 !text-primary font-bold rounded-[4px]",
                    today: "text-primary font-bold border border-primary/20 rounded-[4px]",
                    outside: "text-secondary/10 opacity-30",
                    disabled: "text-secondary/10 opacity-30 cursor-not-allowed",
                    hidden: "invisible",
                  }}
                  components={{
                    Chevron: (props) => {
                      if (props.orientation === 'left') {
                        return (
                          <Image
                            src="/assets/website/icons/left-arrow.svg"
                            alt="Previous month"
                            width={14}
                            height={14}
                            className="object-contain"
                          />
                        );
                      }
                      return (
                        <Image
                          src="/assets/website/icons/right-arrow.svg"
                          alt="Next month"
                          width={14}
                          height={14}
                          className="object-contain"
                        />
                      );
                    }
                  }}
                />
              </div>

              {/* Time Section */}
              <div className="flex flex-col w-full md:w-[135px] bg-white">
                <div className="p-2 sm:p-2.5 border-b border-border-input flex items-center gap-2">
                  <Clock size={14} className="text-secondary" />
                  <Text variant="text-xxs" className="font-bold uppercase tracking-wider text-secondary text-[10px] sm:text-[11px]">{t('time')}</Text>
                </div>
                <div className="overflow-y-auto max-h-[150px] sm:max-h-[220px] md:max-h-[280px] py-0.5 custom-scrollbar bg-white">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant="unstyled"
                      onClick={() => handleSelectTime(time)}
                      className={twMerge(
                        "w-full px-3 py-1.5 text-left transition-colors hover:bg-background-neutral flex justify-start items-center cursor-pointer",
                        selectedTime === time ? "bg-primary/10 text-primary border-r-2 border-primary" : "text-secondary"
                      )}
                    >
                      <Text variant="text-xxs" className={twMerge("text-[11px] sm:text-[12px]", selectedTime === time ? "font-bold" : "font-normal")}>{time}</Text>
                    </Button>
                  ))}
                </div>

                <div className="mt-auto p-2 sm:p-3 border-t border-border-input bg-white">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    className="w-full !h-[36px] sm:!h-[42px] !rounded-[4px] items-center justify-center flex cursor-pointer uppercase"
                    textClassName="text-[10px] font-bold"
                    disabled={!selectedDate || !selectedTime}
                    onClick={handleConfirm}
                  >
                    {t('confirm')}
                  </Button>
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {(errorText && error) && (
          <Text variant="text-xxs" className="text-error-dark font-medium px-1 text-[11px]">
            {errorText}
          </Text>
        )}

        {helperText && !error && (
          <Text variant="text-xxs" className="text-secondary/50 px-1 text-[11px]">
            {helperText}
          </Text>
        )}
      </div>

      <style jsx global>{`
        .rdp {
          --rdp-cell-size: clamp(28px, 6.5vw, 34px);
          --rdp-accent-color: var(--color-primary);
          --rdp-background-color: var(--color-primary-light);
          margin: 0;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};
