export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionProps {
  title: string;
  description?: string;
  items: FaqItem[];
}
