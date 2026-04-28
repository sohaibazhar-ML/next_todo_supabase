export type LogoVariant = 'primary' | 'helvetia' | 'mehrwerk' | 'swisscom' | 'logo2';

export interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  width?: number;
  height?: number;
}
