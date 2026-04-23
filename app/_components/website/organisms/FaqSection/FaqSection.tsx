"use client";

import React from 'react';
import { FaqSectionProps } from '@/website/organisms/FaqSection/FaqSection.types';
import { Text } from '@/website/atoms';
import { FaqAccordionItem } from '@/website/molecules';
import { useAccordion } from '@/app/_hooks/website/useAccordion';

export const FaqSection: React.FC<FaqSectionProps> = ({
  title,
  description,
  items
}) => {
  const { toggle, isOpen } = useAccordion(0);

  return (
    <section className="w-full flex flex-col items-center py-20 px-(--spacing-container-padding)">
      <div className="max-w-[1070px] w-full flex flex-col items-center gap-8">

        {/* Title & Description */}
        <div className="text-center space-y-4 mb-12">
          <Text variant="heading-xl" className="text-secondary">
            {title}
          </Text>
        </div>

        {/* FAQ List with white gaps */}
        <div className="w-full flex flex-col gap-[2px] bg-background-neutral">
          {items.map((item, index) => (
            <FaqAccordionItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={isOpen(index)}
              onToggle={() => toggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
