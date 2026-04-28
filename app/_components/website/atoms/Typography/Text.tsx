import React from 'react';
import { TextProps, TextVariant } from '@/website/atoms/Typography/Text.types';

const variantMap: Record<TextVariant, string> = {
  'h1': 'text-heading-xl font-heading',
  'h2': 'text-heading-l font-heading',
  'h3': 'text-text-xl font-heading',
  'h4': 'text-text-l font-heading',
  'h5': 'text-heading-m font-heading',
  'heading-xl': 'text-heading-xl font-heading',
  'heading-l': 'text-heading-l font-heading',
  'heading-m': 'text-heading-m font-heading',
  'text-xl': 'text-text-xl font-heading',
  'text-l': 'text-text-l font-heading',
  'text-m': 'text-text-m font-heading',
  'text-s': 'text-text-s font-heading',
  'text-xs': 'text-text-xs font-heading',
  'text-xxs': 'text-text-xxs font-heading font-body',
  'login-title': 'text-login-title font-heading',
  'login-description': 'text-login-description font-heading',
  'login-forgot': 'text-login-forgot font-heading font-medium',
  'cta': 'text-cta font-heading font-medium',
  'body-lg': 'text-text-l font-body',
  'body-md': 'text-text-m font-body',
  'body-sm': 'text-text-s font-body',
  'body-xs': 'text-text-xs font-body',
  'dashboard-sidebar': 'text-dashboard-sidebar',
  'card-label': 'text-card-label',
  'card-title': 'text-card-title',
  'progress-label': 'text-progress-label',
};

const defaultTagMap: Record<TextVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  'heading-xl': 'h1',
  'heading-l': 'h2',
  'heading-m': 'h3',
  'text-xl': 'p',
  'text-l': 'p',
  'text-m': 'p',
  'text-s': 'p',
  'text-xs': 'p',
  'text-xxs': 'span',
  'login-title': 'h1',
  'login-description': 'p',
  'login-forgot': 'span',
  'cta': 'span',
  'body-lg': 'p',
  'body-md': 'p',
  'body-sm': 'p',
  'body-xs': 'span',
  'dashboard-sidebar': 'span',
  'card-label': 'span',
  'card-title': 'p',
  'progress-label': 'p',
};

export const Text: React.FC<TextProps> = ({
  variant = 'body-md',
  as,
  className = '',
  children,
  ref,
  ...props
}) => {
  const Component = as || defaultTagMap[variant];
  const variantClasses = variantMap[variant];

  return (
    <Component ref={ref} className={`${variantClasses} ${className}`} {...props}>
      {children}
    </Component>
  );
};
