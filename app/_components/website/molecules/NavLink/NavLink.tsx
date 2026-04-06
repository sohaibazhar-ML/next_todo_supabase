import React from 'react';
import { Link } from '@/i18n/routing';
import { NavLinkProps } from '@/website/molecules/NavLink/NavLink.types';
import { Text } from '@/website/atoms';

export const NavLink: React.FC<NavLinkProps> = ({
  href,
  children,
  isActive = false,
  className = '',
  onClick,
  disableTruncate = false
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={typeof children === 'string' ? children : undefined}
      className={`group relative py-2 transition-colors duration-200 ${className}`}
    >
      <div className={`relative ${disableTruncate ? 'w-auto' : 'max-w-[120px] lg:max-w-[130px] xl:max-w-[160px] overflow-hidden'}`}>
        <Text
          variant="body-md"
          title={typeof children === 'string' ? children : undefined}
          className={`font-medium transition-colors whitespace-nowrap ${disableTruncate ? '' : 'truncate hover-marquee'} ${isActive ? 'text-primary' : 'text-secondary group-hover:text-primary'
            }`}
        >
          {children}
        </Text>
      </div>

      {/* Active Indicator Underline */}
      <div 
        className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
          }`} 
      />
    </Link>
  );
};
