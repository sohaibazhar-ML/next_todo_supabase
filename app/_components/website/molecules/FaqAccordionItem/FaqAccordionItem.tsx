"use client";

import React from 'react';
import { FaqAccordionItemProps } from '@/website/molecules/FaqAccordionItem/FaqAccordionItem.types';
import { Text, Image, Button } from '@/website/atoms';

export const FaqAccordionItem: React.FC<FaqAccordionItemProps> = ({
  question,
  answer,
  isOpen,
  onToggle,
}) => {
  return (
    <Button
      variant="unstyled"
      className="w-full bg-background-secondary relative transition-all duration-300 ease-in-out cursor-pointer overflow-hidden mb-3 border-none p-0 text-left block"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      {/* Question Header */}
      <div className="px-6 py-5 sm:px-8 sm:py-6 flex justify-between items-start gap-4 pr-12">
        <div className="flex-1">
          <Text variant="heading-m" className="text-secondary select-none">
            {question}
          </Text>
        </div>
      </div>

      {/* Answer Body */}
      <div
        className={`px-8 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] pb-8 opacity-100' : 'max-h-0 pb-0 opacity-0 px-8'
          }`}
      >
        <Text variant="text-m" className="text-secondary leading-relaxed">
          {answer}
        </Text>
      </div>

      {/* Unified Icon (Figma Style) */}
      <div className={`absolute transition-all duration-300 ${isOpen ? 'top-4 right-4 rotate-270' : 'bottom-4 right-4'
        }`}>
        <Image
          src="/assets/website/icons/grey-down-arrow-icon.png"
          alt="Toggle"
          width={16}
          height={16}
          className="w-3 h-auto object-contain opacity-60"
        />
      </div>
    </Button>
  );
};
