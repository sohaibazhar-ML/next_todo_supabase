import { ReactNode } from 'react';

export type TextVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' 
  | 'heading-xl' | 'heading-l' | 'heading-m'
  | 'text-xl' | 'text-l' | 'text-m' | 'text-s' | 'text-xs' | 'text-xxs'
  | 'login-title' | 'login-description' | 'login-forgot' | 'cta'
  | 'body-lg' | 'body-md' | 'body-sm' | 'body-xs'
  | 'dashboard-sidebar'
  | 'card-label'
  | 'card-title'
  | 'progress-label'
  | 'table-heading'
  | 'table-data';

export type TextTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: TextTag;
  className?: string;
  children: ReactNode;
  ref?: React.Ref<HTMLElement>;
}
