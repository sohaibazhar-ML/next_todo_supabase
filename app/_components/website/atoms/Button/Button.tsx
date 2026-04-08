"use client";

import React from 'react';
import { useFormStatus } from 'react-dom';
import { ButtonProps } from '@/website/atoms/Button/Button.types';
import { Loader2 } from 'lucide-react';
import { Text } from '@/website/atoms/Typography/Text';
import { TextVariant } from '@/website/atoms/Typography/Text.types';
import { twMerge } from 'tailwind-merge';

const variantClasses: Record<string, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
  secondary: 'bg-secondary text-white hover:opacity-90 shadow-sm',
  outline: 'border border-border-input bg-transparent hover:bg-background-secondary text-foreground font-semibold',
  ghost: 'bg-transparent hover:bg-background-secondary text-foreground font-semibold',
  link: 'bg-transparent text-primary hover:underline p-0 h-auto font-semibold',
  unstyled: '',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-[40px] px-4 rounded-[6px]',
  md: 'h-[48px] px-6 rounded-[6px]',
  lg: 'h-[52px] px-8 rounded-[8px]',
};

// Map button sizes to text variants
const textVariantMap: Record<string, TextVariant> = {
  sm: 'text-s',
  md: 'cta',
  lg: 'text-l',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  isLoading = false,
  fullWidth = false,
  disabled,
  width,
  minWidth,
  textClassName = '',
  className = '',
  style = {},
  children,
  ref,
  ...props
}) => {
  const { pending } = useFormStatus();
  const actualLoading = isLoading || pending;
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:bg-background-neutral disabled:cursor-not-allowed disabled:active:scale-100';

  const customStyles = {
    ...style,
    width: width || (fullWidth ? '100%' : style.width),
    minWidth: minWidth || style.minWidth,
  };

  return (
    <button
      ref={ref}
      className={twMerge(
        variant === 'unstyled'
          ? 'cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50'
          : baseClasses,
        variant !== 'unstyled' && variantClasses[variant],
        variant !== 'unstyled' && sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || actualLoading}
      style={customStyles}
      {...props}
    >
      {variant === 'unstyled' ? (
        children
      ) : (
        <div className="relative flex items-center justify-center gap-2">
          {actualLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
          <Text
            as="span"
            variant={textVariantMap[size]}
            className={twMerge(
              "flex items-center gap-2 font-semibold",
              textClassName,
              actualLoading ? 'opacity-70' : 'opacity-100'
            )}
          >
            {!actualLoading && LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />}
            {children}
            {!actualLoading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
          </Text>
        </div>
      )}
    </button>
  );
};
