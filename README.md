# @askrjs/ui

Headless UI components for Askr applications.

`@askrjs/ui` owns interaction behavior, accessibility wiring, and structural
composition. It does not impose visual styling. Pair it with
[`@askrjs/themes`](https://github.com/askrjs/askr-themes) for default visuals,
or supply your own CSS.

## Install

```bash
npm install @askrjs/ui @askrjs/askr
npm install @askrjs/themes
```

## Use

Import the root package when you want the full composition surface:

```tsx
import { Button, Dialog, DialogTrigger, DialogContent } from '@askrjs/ui';
```

Use per-component subpaths when you want smaller bundles or direct entrypoints:

```tsx
import { Button } from '@askrjs/ui/button';
import { Dialog } from '@askrjs/ui/dialog';
```

## Docs

- [askr-ui overview](./docs/askr-ui.md)
- [components reference](./docs/components.md)
- [composition patterns](./docs/composition.md)
- [foundations reference](./docs/foundations.md)

## Package shape

The package exports components directly from the root and per-component subpaths:

- Core controls: `Button`, `Toggle`, `Checkbox`, `Input`, `Textarea`,
  `Label`, `RadioGroup`, `Switch`, `Select`, `Slider`, `ToggleGroup`,
  `VisuallyHidden`
- Interaction helpers: `FocusScope`, `DismissableLayer`
- Overlays: `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `Dropdown`, `Menu`
- Disclosure: `Accordion`, `Collapsible`
- Status: `Progress`, `ProgressCircle`, `Toast`
- Identity: `Avatar`
- Tables: `Table`, `TableCaption`, `TableHead`, `TableBody`, `TableFoot`,
  `TableRow`, `TableHeaderCell`, `TableCell`
- Navigation: `Menubar`

Prefer the per-component subpaths when you want a smaller surface area.

For the full surface and composition examples, start with the docs above.
