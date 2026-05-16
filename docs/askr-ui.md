# askr-ui

`@askrjs/ui` is the headless component package for Askr applications.

## Purpose

askr-ui owns behavior, accessibility, state coordination, and composable
structure. It does not own visual styling. Consumers should pair it with
`askr-themes` or their own CSS system for presentation.

## Entry points

- Use the package root for the common, curated public surface.
- Use direct subpaths when you want a narrower, explicit import.
- Use the component docs when you need the full surface for a family.

```ts
import { Button, Checkbox, Input, Label } from '@askrjs/ui';
import { Dialog, Popover, Tooltip } from '@askrjs/ui';
import { Dialog } from '@askrjs/ui/dialog';
```

## Documentation map

- [Foundations](./foundations.md) - runtime helpers that support composition
- [Components](./components.md) - public families, aliases, and helper parts
- [Composition](./composition.md) - recommended usage patterns and examples

## Implementation model

The package follows a flat source layout:

- each public component family lives in its own folder under `src/components/`
- shared implementation helpers live under `src/components/_internal/`
- public exports are intentionally curated and contract-tested

## Related packages

- `@askrjs/askr` - runtime and shared foundation helpers
- `@askrjs/themes` - visual styling, layout wrappers, and theme-owned surface
