# Textarea Specs

## Purpose
The `Textarea` atom provides a multi-line input component, maintaining stylistic parity with the Input atom while offering expanded vertical space.

## Component Interface
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;            // Mandatory for accessibility/labeling
  label?: string;        // Descriptive text above field
  error?: boolean;       // Error state flag
  errorText?: string;    // Validation message displayed below
  helperText?: string;   // Contextual information below (if no error)
  inputSize?: 'sm' | 'md'; // Consistent padding with Input
  ref?: React.Ref<HTMLTextAreaElement>;
  rows?: number;         // Vertical height control
}
```

## Technical Implementation
- **Anatomy**: Uses a native `<textarea>` element with custom Tailwind styling.
- **Resizing**: Default behavior set to `resize-y`, allowing vertical expansion only.
- **Encapsulation**: No raw `<textarea>` tags should be used in features. Always wrap in `<Textarea>`.
- **Ref Forwarding**: Fully supported for integration with form controllers.

## Validation Rules
- **State Logic**: Matches the `Input` atom's state coloring (Default, Focus, Filled, Error).
- **Filled Check**: Uses the `:not(:placeholder-shown)` selector to trigger border and text color change.
- **Label**: Always uses the standard `Text` atom with `variant="text-xxs"`.
