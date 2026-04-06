# Checkbox Constraints

## Design Token Matrix
The following table defines the relationship between Figma tokens and code.

| State | Hexadecimal Code | Tailwind Reference | Property |
| :--- | :--- | :--- | :--- |
| **Unchecked** | `#A0A2A1` | `border-border-input` | Border |
| **Checked** | `#E3311D` | `checked:bg-primary`, `checked:border-primary` | Background & Border |
| **Hover** | `#0272A2` | `hover:border-accent` | Border |
| **Error** | `#CE3C03` | `!border-error-dark` | Border |
| **Icon** | `#FFFFFF` | `text-white` | Checkmark Icon |

## Dimensional Specifications
- **Size**: $20px \times 20px$ (w-5 h-5)
- **Radius**: $2px$ (rounded-[2px])
- **Border Width**: $1px$
- **Checkmark Icon**: $12px \times 12px$ (w-3 h-3)

## Validation for Handoff
> [!IMPORTANT]
> The `Checkbox` must always use the standard `checkmark.svg` for the "Checked" visual.
> 
> The transition should be smooth, with standard `transition-all` Tailwind behavior.
