/**
 * Checklist item with a checkmark icon
 * Reusable for both MyDocuments and AllDocuments sections
 */

import IconCheckCircle from '@/components/ui/icons/IconCheckCircle'

interface ChecklistItemProps {
  text: string;
}

export default function ChecklistItem({ text }: ChecklistItemProps) {
  return (
    <li className="flex items-start gap-3">
      <IconCheckCircle
        size={20}
        className="text-[#e62e2d] flex-shrink-0 mt-0.5"
      />
      <span className="text-[14px] md:text-[15px] text-[#4a4a4a] leading-relaxed">
        {text}
      </span>
    </li>
  )
}
