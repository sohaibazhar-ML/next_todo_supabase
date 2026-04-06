import { ImageProps as NextImageProps } from 'next/image';
import { ReactNode, Ref } from 'react';

export interface ImageAtomProps extends Omit<NextImageProps, 'ref' | 'onClick'> {
  /**
   * React 19 ref support
   */
  ref?: Ref<HTMLElement>;
  /**
   * Additional class name for the wrapper (button or link)
   */
  containerClassName?: string;
  
  /**
   * If provided, the image will be wrapped in a button
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * If provided, the image will be wrapped in an i18n Link
   */
  href?: string;
  
  /**
   * Explicitly force a button wrapper even without onClick
   */
  isButton?: boolean;
}
