# Image Specs

## Purpose
The `Image` atom is a production-level wrapper for `next/image`, adding additional functionality for navigation and button-like interactions while maintaining strict object-fit rules.

## Component Interface
```typescript
interface ImageAtomProps extends React.ComponentProps<typeof NextImage> {
  src: string | StaticImageData;
  alt: string;           // Mandatory for accessibility
  containerClassName?: string; // Styles for wrapper
  onClick?: () => void;  // Optional click interaction
  href?: string;         // Optional navigation wrap
  isButton?: boolean;    // Treats image as a button (UX)
  ref?: React.Ref<HTMLElement>;
}
```

## Technical Implementation
- **Wrappers**:
    - `href` -> Wraps image in `Link` component.
    - `onClick` / `isButton` -> Wraps image in `Button` atom with `variant="unstyled"`.
- **Optimization**: All images should have an `alt` tag. Use `priority={true}` for initial UI-critical assets (Logo).
- **Ref Forwarding**: Fully supported for integration with animation libraries.

## Validation Rules
- **Proportions**: Images should use parent-defined `aspect-*` and `object-*` (e.g., `object-cover` or `object-contain`) instead of hardcoded `px` values for width and height when using `fill`.
- **Performance**: Automated lazy-loading implementation through the base `NextImage`.
- **Accessibility**: ARIA attributes are automatically handled when `isButton` is set.
