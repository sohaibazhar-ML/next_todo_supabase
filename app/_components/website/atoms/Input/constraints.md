# Input Constraints

## Design Tokens Matrix
The following table defines the relationship between Figma tokens and code.

| State | Hexadecimal Code | Tailwind Reference | Property |
| :--- | :--- | :--- | :--- |
| **Default** | `#8B8281`, `#A0A2A1` | `text-secondary`, `border-border-input` | Text & Border |
| **Hover** | `#0272A2` | `hover:border-accent` | Border |
| **Focus** | `#0272A2` | `focus:border-accent`, `focus:text-accent` | Text & Border |
| **Filled** | `#362E2D` | `border-secondary`, `text-secondary` | Text & Border |
| **Error** | `#CE3C03` | `!border-error-dark`, `!text-error-dark` | Text & Border |
| **Placeholder** | `#8B8281/40%` | `placeholder:text-input-placeholder` | Text |

## Dimensional Specifications
- **Height (md)**: $44px$ (h-[44px])
- **Height (sm)**: $34px$ (h-[34px])
- **Radius**: $2px$ (rounded-[2px])
- **Border Width**: $1px$

## Content Layout
- **Left Icon**: $18px$ (md), $16px$ (sm). Padding-left: $10px$ (pl-10).
- **Right Icon**: $18px$ (md), $16px$ (sm). Padding-right: $10px$ (pr-10).
- **Label Spacing**: $6px$ (gap-1.5).
- **Error Spacing**: $6px$ (gap-1.5).

## Validation for Handoff
> [!IMPORTANT]
> The background of the input must always be exactly `bg-white` unless in a `disabled` state.
> 
> Border and Text color should be exactly `#362E2D` for the `:not(:placeholder-shown)` state (Filled).
