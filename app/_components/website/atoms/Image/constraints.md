# Image Constraints

## Design Token Matrix
The following table defines the relationship between Figma tokens and code.

| State | Hexadecimal Code | Tailwind Reference | Property |
| :--- | :--- | :--- | :--- |
| **Interactive (Hover)** | `opacity-100%` | `transition-all` | Opacity |
| **Active (Scale)** | `95% scale` | `active:scale-95` | Transform |
| **Container** | `#F9F8F4` | `bg-background-neutral` | Background |

## Dimensional Specifications
- **Radius (Content)**: $6px$ (rounded-[6px]) for general feature images.
- **Radius (UI Icons)**: $0px$ (rounded-none).
- **Default Width**: $100\%$ (width in parent container).

## Content Layout
- **Object Fit**: Default to `object-contain` for logos; `object-cover` for hero/feature images.
- **Lazy Loading**: Integrated with `Next.js` (`loading="lazy"`).

## Validation for Handoff
> [!IMPORTANT]
> The `alt` text must exactly match the Figma design label if it is content-heavy.
> 
> For interactive images, the wrap uses the `Button` atom to inherit global tactile feedback constraints (`active:scale-95`).
