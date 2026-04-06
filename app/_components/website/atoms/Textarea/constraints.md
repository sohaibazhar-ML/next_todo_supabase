# Textarea Constraints

## Design Token Matrix
The following table defines the relationship between Figma tokens and code.

| State | Hexadecimal Code | Tailwind Reference | Property |
| :--- | :--- | :--- | :--- |
| **Default** | `#A0A2A1`, `#362E2D` | `border-border-input`, `text-secondary` | Text & Border |
| **Hover** | `#0272A2` | `hover:border-accent` | Border |
| **Focus** | `#0272A2` | `focus:border-accent`, `focus:text-accent` | Text & Border |
| **Filled** | `#362E2D` | `border-secondary`, `text-secondary` | Text & Border |
| **Error** | `#CE3C03` | `!border-error-dark`, `!text-error-dark` | Text & Border |

## Dimensional Specifications
- **Radius**: $2px$ (rounded-[2px])
- **Border Width**: $1px$
- **Padding (md)**: $12px \times 16px$ (py-3 px-4)
- **Padding (sm)**: $8px \times 12px$ (py-2 px-3)

## Validation for Handoff
> [!IMPORTANT]
> The vertical resize handle must be present, but horizontal resizing is strictly prohibited.
> 
> The fallback placeholder must be a single space (`" "`) to ensure the `:not(:placeholder-shown)` CSS selector functions correctly for fixed labels.
