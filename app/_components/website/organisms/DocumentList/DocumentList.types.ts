import { DocumentItem } from '@/website/molecules/DocumentRow/DocumentRow.types';

export interface DocumentListProps {
  documents: DocumentItem[];
  totalPages: number;
  currentPage: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  className?: string;
}
