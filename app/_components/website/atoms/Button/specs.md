# Button Specs

## Purpose
The `Button` atom is the primary interaction component for all website actions. It supports various sizes, variants, and loading states while strictly adhering to Design System tokens.

## Component Interface
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'unstyled';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  isLoading?: boolean;   // Displays spinner and disables interaction
  fullWidth?: boolean;   // Horizontal expansion to 100%
  width?: number | string; // Specific manual width
  minWidth?: number | string; // Minimal width with expansion
  ref?: React.Ref<HTMLButtonElement>;
}
```

## Technical Implementation
- **Loading State**: Uses `Loader2` from `lucide-react` with `.animate-spin`.
- **Text Mapping**: Maps `size` to `Text` variants (`sm` -> `text-s`, `md` -> `cta`, `lg` -> `text-l`).
- **Anatomy**: Encapsulated `<button>` tag with strict CSS reset via `variant="unstyled"`.
- **Ref Forwarding**: Fully supported for DOM access and third-party libraries.

## Validation Rules
- **Encapsulation**: No raw `<button>` tags outside this atom.
- **Icon Alignment**: Icons must be exactly $16px$ (w-4 h-4) and aligned horizontally with the text.
- **Spinner Positioning**: Displays to the left of the button text when `isLoading` is true.
