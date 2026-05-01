# @askrjs/ui

Headless UI components for Askr applications.

`@askrjs/ui` owns interaction behavior, accessibility wiring, and structural
composition. It does not impose visual styling. Pair it with
[`@askrjs/themes`](https://github.com/askrjs/askr-themes) for default visuals,
or supply your own CSS.

## Install

```bash
npm install @askrjs/ui @askrjs/askr
```

## Use

```tsx
import { Button, Dialog, DialogTrigger, DialogContent } from '@askrjs/ui';
```

## Docs

- [askr-ui overview](./docs/askr-ui.md)
- [components reference](./docs/components.md)
- [composition patterns](./docs/composition.md)
- [foundations reference](./docs/foundations.md)

## Package shape

The package exports components by family:

- Primitives: `Button`, `Toggle`, `Checkbox`, `Input`, `Textarea`, `Label`,
  `RadioGroup`, `Switch`, `Select`, `Slider`, `ToggleGroup`, `VisuallyHidden`
- Focus: `FocusScope`, `DismissableLayer`
- Overlays: `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `DropdownMenu`,
  `Menu`
- Disclosure: `Accordion`, `Collapsible`, `Tabs`
- Status: `Progress`, `ProgressCircle`, `Toast`
- Identity: `Avatar`
- Tables: `Table`, `TableCaption`, `TableHead`, `TableBody`, `TableFoot`,
  `TableRow`, `TableHeaderCell`, `TableCell`
- Navigation: `Menubar`, `NavigationMenu`

For the full surface and composition examples, start with the docs above.
