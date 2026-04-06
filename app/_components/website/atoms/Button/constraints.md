# Button Constraints

## Design Token Matrix
The following table defines the relationship between Figma tokens and code.

| State | Hexadecimal Code | Tailwind Reference | Property |
| :--- | :--- | :--- | :--- |
| **Primary (Default)** | `#E3311D` | `bg-primary`, `text-white` | Background & Text |
| **Primary (Hover)** | `#DA1701` | `hover:bg-primary-hover` | Background |
| **Secondary (Default)** | `#362E2D` | `bg-secondary`, `text-white` | Background & Text |
| **Secondary (Hover)** | `#362E2D/90%` | `hover:opacity-90` | Background |
| **Outline (Default)** | `#A0A2A1` | `border-border-input` | Border |
| **Disabled** | `#362E2D/50%` | `disabled:opacity-50` | Background |

## Dimensional Specifications
- **Size (lg)**: $52px$ height, $8px$ radius (h-[52px] rounded-[8px]).
- **Size (md)**: $48px$ height, $6px$ radius (h-[48px] rounded-[6px]).
- **Size (sm)**: $40px$ height, $6px$ radius (h-[40px] rounded-[6px]).
- **Min Width (Auth)**: $294px$ (minWidth={294} per user's latest manual preference).

## Typography Mapping
- **SM size**: text-s
- **MD size**: cta
- **LG size**: text-l

## Validation for Handoff
> [!IMPORTANT]
> The primary action button on authentication forms must always have a **minimum width of 294px** and **46px height** with **uppercase font-bold** as per the latest manual override.
> 
> All buttons should use the transition `active:scale-[0.98]` to provide tactile feedback.
