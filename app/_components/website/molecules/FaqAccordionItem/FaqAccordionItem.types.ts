import { ReactNode } from 'react';

export interface FaqAccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}
