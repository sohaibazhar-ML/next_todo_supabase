# Input Specs

## Purpose
The `Input` atom is the base entry component for all user data across the website. It provides built-in label management, error state handling, and support for icons.

## Component Interface
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;            // Mandatory for accessibility/labeling
  label?: string;        // Descriptive text above field
  error?: boolean;       // Error state flag
  errorText?: string;    // Validation message displayed below
  helperText?: string;   // Contextual information below (if no error)
  leftIcon?: LucideIcon; // Icon inside field (Left)
  rightIcon?: LucideIcon;// Icon inside field (Right)
  inputSize?: 'sm' | 'md'; // md: 44px (default), sm: 34px
  ref?: React.Ref<HTMLInputElement>;
}
```

## State-Specific Logic
- **Hover**: Slight border darkening (border-accent).
- **Focus**: Border and text color change to `#0272A2` (focus:border-accent).
- **Filled**: Border and text color change to `#362E2D` (border-secondary).
- **Error**: Overrides all other states with `#CE3C03` (!border-error-dark).
- **Disabled**: Fixed opacity with `disabled:bg-background-neutral`.

## Encapsulation rules
- **Zero HTML**: No manual `<input>` tags outside this atom.
- **Labeling**: Labels always use the standard `Text` atom with `variant="text-xxs"`.
- **Ref forwarding**: Forwarding is mandatory to support integration with form libraries or `useRef`.
