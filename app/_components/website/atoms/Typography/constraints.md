# Typography (Text) Constraints

## Design Token Matrix
The following table defines the relationship between Figma tokens, CSS variables, and Tailwind classes.

| Variant | Font Size (clamp) | Line Height | Weight | Tailwind Reference |
| :--- | :--- | :--- | :--- | :--- |
| `heading-xl` | `clamp(32px, 3.5vw, 42px)` | 1.25 | Medium | `text-heading-xl` |
| `heading-l` | `clamp(28px, 3vw, 38px)` | 1.2 | Medium | `text-heading-l` |
| `heading-m` | `clamp(20px, 2.5vw, 22px)` | 1.2 | Medium | `text-heading-m` |
| `text-xl` | `clamp(22px, 2.5vw, 27px)` | 1.2 | SemiCondensed | `text-text-xl` |
| `text-l` | `clamp(20px, 2vw, 24px)` | 1.15 | Medium | `text-text-l` |
| `text-m` | `clamp(18px, 1.8vw, 23px)` | 1.35 | Regular | `text-text-m` |
| `text-s` | `clamp(16px, 1.6vw, 21px)` | 1.35 | Medium | `text-text-s` |
| `text-xs` | `clamp(14px, 1.4vw, 18px)` | 1.3 | Regular | `text-text-xs` |
| `text-xxs` | `clamp(12px, 1.2vw, 16px)` | 1.25 | Regular | `text-text-xxs` |
| `cta` | `clamp(16px, 1.6vw, 19px)` | 1.4 | Medium | `text-cta` |

## Color Constraints
Default values as per Figma Color tokens:
- **Primary**: `#362E2D` (text-secondary)
- **Secondary**: `#8B8281` (text-secondary/70)
- **Accent (Links)**: `#0272A2` (text-accent)
- **Error**: `#CE3C03` (text-error-dark)

## Validation for Handoff
> [!IMPORTANT]
> The `Text` atom should **not** have custom margin or padding applied directly to it. Spacing is the responsibility of the parent molecule or organism.
> 
> No manual `px` font sizes should be used in the codebase. Always use the specified variant.
