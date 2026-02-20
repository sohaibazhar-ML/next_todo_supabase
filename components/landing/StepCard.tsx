/**
 * Single step card — HORIZONTAL layout (number LEFT of text)
 * Matches reference: large gray number beside bold title + light description
 */

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

export default function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[48px] md:text-[56px] font-bold text-[#c8c8c8] leading-none select-none flex-shrink-0">
        {number}
      </span>
      <div className="pt-2">
        <p className="text-[14px] md:text-[15px] font-semibold text-[#555] leading-snug">
          {title}
        </p>
        <p className="text-[13px] md:text-[14px] text-[#999] leading-snug">
          {description}
        </p>
      </div>
    </div>
  )
}
