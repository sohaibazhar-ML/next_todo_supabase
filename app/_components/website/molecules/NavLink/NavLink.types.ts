export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
  disableTruncate?: boolean;
}
