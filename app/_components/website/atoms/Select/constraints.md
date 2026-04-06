# Select Constraints

## Design Token Matrix
The following table defines the relationship between Figma tokens and code.

| State | Hexadecimal Code | Tailwind Reference | Property |
| :--- | :--- | :--- | :--- |
| **Default** | `#A0A2A1`, `#362E2D` | `border-border-input`, `text-secondary` | Text & Border |
| **Hover** | `#0272A2` | `hover:border-accent` | Border |
| **Focus** | `#0272A2` | `focus:border-accent`, `focus:text-accent` | Text & Border |
| **Error** | `#CE3C03` | `!border-error-dark`, `!text-error-dark` | Text & Border |
| **Arrow** | `#8B8281/40%` | `opacity-40` | Custom Icon |

## Dimensional Specifications
- **Height**: $44px$ (h-[44px])
- **Radius**: $2px$ (rounded-[2px])
- **Border Width**: $1px$
- **Custom Arrow Icon**: $12px \times 12px$ (w-[12px] h-[12px])

## Content Layout
- **Padding**: $px-4$ (md)
- **Select Arrow Padding**: $pr-10$ (Internal selection space)
- **Label Spacing**: $6px$ (gap-1.5)

## Validation for Handoff
> [!IMPORTANT]
> The custom arrow icon must be positioned exactly $12px$ from the right edge.
> 
> The background must always be exactly `bg-white` unless in a `disabled` state.
