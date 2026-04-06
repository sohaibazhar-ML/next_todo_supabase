# Typography (Text) Specs

## Purpose
The `Text` atom is the single source of truth for all text rendering on the website. It abstracts typography logic, ensuring consistent semantic tagging and design token usage.

## Component Interface
```typescript
interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant; // h1, h2, heading-xl, text-m, body-md, cta, etc.
  as?: TextTag;         // h1, h2, p, span, div, label
  className?: string;    // Custom style overrides (use sparingly)
  children: ReactNode;   // Text content or nested elements
  ref?: React.Ref<HTMLElement>; // Forwarded ref for animations/DOM access
}
```

## Technical Implementation
- **Ref Forwarding**: Mandatory support for `ref` using standard React 19 props spread.
- **Tag Mapping**: Matches variants to semantic tags by default (e.g., `heading-xl` -> `h1`, `text-m` -> `p`).
- **Encapsulation Rule**: No raw `<p>`, `<span>`, or `<h*>` tags should be used in features. Always wrap text in `<Text>`.

## Validation Rules
- **Color Logic**: Defaults to the parent container's color. Should be overridden using Tailwind classes (e.g., `text-secondary/70`) through the `className` prop.
- **Weight Enforcement**: Variants like `cta` and `heading-*` have hardcoded weights (`font-heading`, `font-medium`) to prevent accidental layout shifts.
- **Scaling**: Uses the atomic typography scale defined in `globals.css` (@theme variables).
