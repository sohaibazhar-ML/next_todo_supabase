export type LogoVariant = 'primary' | 'helvetia' | 'mehrwerk' | 'swisscom';

export interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  width?: number;
  height?: number;
}
