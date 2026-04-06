"use client";

import React from 'react';
import NextImage from 'next/image';
import { Link } from '@/i18n/routing';
import { Button } from '@/website/atoms/Button/Button';
import { ImageAtomProps } from '@/website/atoms/Image/Image.types';

export const Image: React.FC<ImageAtomProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  containerClassName = '',
  onClick,
  href,
  isButton,
  ref,
  ...props
}) => {
  const imageElement = (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      ref={onClick || isButton || href ? undefined : (ref as React.Ref<HTMLImageElement>)}
      {...props}
    />
  );

  // If href is provided, wrap in Link
  if (href) {
    return (
      <Link href={href} className={`inline-block ${containerClassName}`} ref={ref as React.Ref<HTMLAnchorElement>}>
        {imageElement}
      </Link>
    );
  }

  // If onClick or isButton is provided, wrap in Button atom
  if (onClick || isButton) {
    return (
      <Button
        variant="unstyled"
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        className={`inline-block cursor-pointer bg-transparent border-none p-0 focus:outline-none transition-all active:scale-95 ${containerClassName}`}
      >
        {imageElement}
      </Button>
    );
  }

  // Default: just the image
  return imageElement;
};
