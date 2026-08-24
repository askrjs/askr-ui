# @askrjs/ui

[![CI](https://github.com/askrjs/askr-ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/askrjs/askr-ui/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/%40askrjs%2Fui.svg)](https://www.npmjs.com/package/@askrjs/ui)

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
import {
  Button,
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from '@askrjs/ui';

<Dialog>
  <DialogTrigger>Open dialog</DialogTrigger>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent>Confirm action</DialogContent>
  </DialogPortal>
</Dialog>;
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
- [changelog](./CHANGELOG.md)

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

## Themes catalog boundary

`@askrjs/themes` also publishes styling-only compatibility anatomy for Tabs,
Combobox, Calendar/DatePicker, Command, NavigationMenu, Carousel,
ResizablePanelGroup, and InputOTP. Those names are not `@askrjs/ui`
primitives and do not provide widget state, keyboard interaction, focus
management, or ARIA relationships. Applications must not treat those themed
slots as behavioral widgets.

When Askr adds behavior for one of these families, the implementation belongs
in this package first and must meet the same controlled/uncontrolled state,
keyboard, focus, disabled, RTL, forced-colors, misuse, determinism, and browser
coverage requirements as every existing public family. Themes may then compose
that public primitive rather than reproducing its state.
