# Checkbox Specs

## Purpose
The `Checkbox` atom provides a custom implementation of a boolean input, ensuring it matches the Design System's selection UX.

## Component Interface
```typescript
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;          // Mandatory for accessibility/labeling
  label?: string;      // Label text to the right
  error?: boolean;     // Error state flag
  errorText?: string;  // Validation message displayed below
  ref?: React.Ref<HTMLInputElement>;
}
```

## Technical Implementation
- **Anatomy**: Wraps a hidden standard checkbox input with a custom visual element.
- **Custom Icon**: Uses `checkmark.svg` for the "Checked" state.
- **Encapsulation**: No raw `<input type="checkbox">` should be used in features. Always wrap in `<Checkbox>`.
- **Ref Forwarding**: Fully supported for integration with form controllers.

## Validation Rules
- **Hover Logic**: Border color change to `hover:border-accent`.
- **Checked Color**: Background color should be exactly `#E3311D` (checked:bg-primary).
- **Label**: Always uses the standard `Text` atom with `variant="text-xxs"`.
