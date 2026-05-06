import { LogoProps } from '@/website/atoms/Logo/Logo.types';
import { Image } from '@/website/atoms';

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'primary', 
  className = '', 
  width, 
  height 
}) => {
  const getLogoSrc = () => {
    switch (variant) {
      case 'helvetia':
        return '/assets/website/logos/Logo_helvetia_022026 1.png';
      case 'mehrwerk':
        return '/assets/website/logos/Logo_mehrwerk_022026 1.png';
      case 'swisscom':
        return '/assets/website/logos/myswissmove_logo-new.svg';
      case 'logo2':
        return '/assets/website/logos/myswissmove_logo_white.svg';
      case 'primary':
      default:
        return '/assets/website/logos/myswissmove_logo-new.svg';
    }
  };

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={getLogoSrc()}
        alt={`${variant} logo`}
        fill
        sizes="180px"
        className="object-contain"
        priority
      />
    </div>
  );
};
