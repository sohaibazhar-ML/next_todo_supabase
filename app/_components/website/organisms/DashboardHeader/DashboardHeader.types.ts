import { ReactNode } from 'react';

export interface DashboardHeaderProps {
  className?: string;
  activeTab?: 'account' | 'documents' | 'profile' | 'dashboard' | 'settings' | 'my-documents';
  isAccountPage?: boolean;
}
