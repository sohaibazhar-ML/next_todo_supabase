# Logo Specs

## Purpose
The `Logo` atom provides a standardized wrapper for all brand assets, ensuring consistent aspect ratios and variant management (Helvetia, Mehrwerk, Swisscom).

## Component Interface
```typescript
interface LogoProps {
  variant?: 'primary' | 'helvetia' | 'mehrwerk' | 'swisscom';
  className?: string;    // Custom wrapper class
  width?: number | string;
  height?: number | string;
}
```

## Technical Implementation
- **Asset Mapping**: Maps brand names to internal file paths (e.g., `helvetia` -> `/assets/website/logos/Logo_helvetia_022026 1.png`).
- **Encapsulation**: Uses the `Image` atom as its underlying engine.
- **Priority Loading**: All primary branding logos must have the `priority` prop enabled for LCP (Largest Contentful Paint) optimization.

## Validation Rules
- **Proportions**: Logos must always use `object-contain` to preserve their aspect ratio regardless of the wrapper container's size.
- **Fallback**: Defaults to the standard Swisscom logo if no variant is specified.
- **Responsive**: The wrapper uses `relative` positioning and `fill` layouts to allow parent components to control logo scale.
