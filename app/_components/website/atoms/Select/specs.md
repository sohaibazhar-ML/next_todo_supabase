# Select Specs

## Purpose
The `Select` atom provides a standardized dropdown input component, ensuring it matches the Input atom's look and feel while offering custom selection UX.

## Component Interface
```typescript
interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;          // Mandatory for accessibility/labeling
  label?: string;      // Label text above
  error?: boolean;     // Error state flag
  errorText?: string;  // Validation message displayed below
  options: SelectOption[];
  placeholder?: string; // Optional default placeholder option
  ref?: React.Ref<HTMLSelectElement>;
}
```

## Technical Implementation
- **Anatomy**: Uses a native `<select>` element wrapped in a custom styled container.
- **Custom Arrow**: Replaces the default browser arrow with a custom `grey-down-arrow-icon.png` for consistency.
- **Encapsulation**: No raw `<select>` tags should be used in features. Always wrap in `<Select>`.
- **Ref Forwarding**: Fully supported for integration with form controllers.

## Validation Rules
- **State Logic**: Matches the `Input` atom's state coloring (Default, Focus, Filled, Error).
- **Height**: MD size must be exactly $44px$ to align with `Input`.
- **Label**: Always uses the standard `Text` atom with `variant="text-xxs"`.
