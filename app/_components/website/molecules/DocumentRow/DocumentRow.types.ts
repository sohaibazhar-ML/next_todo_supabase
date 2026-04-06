export interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'doc';
  size: string;
  url: string;
}

export interface DocumentRowProps {
  document: DocumentItem;
  index: number;
  className?: string;
}
