# askr-ui

`@askrjs/ui` provides headless UI primitives for Askr applications.

## What askr-ui is

askr-ui owns interaction behavior, state coordination, accessibility wiring,
and structural composition. It does not impose visual styling. Pair it with
`askr-themes` for default visuals, or supply your own CSS.

Shared foundation implementations are centralized in `@askrjs/askr/foundations`.

## Package shape

The package is organized into an overview page plus three supporting
documentation areas:

- [Foundations](./foundations.md) for the shared runtime helpers askr-ui uses
- [Components](./components.md) for the public component surface
- [Composition](./composition.md) for examples that combine primitives

Use the package root for most application code:

```ts
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  Table,
} from '@askrjs/ui';
```

Use direct component paths when you want a smaller and more explicit surface:

```ts
import { Button, Checkbox, Input } from '@askrjs/ui';
import { Dialog, Popover, Tooltip } from '@askrjs/ui';
```

The component-level subpaths remain available for direct imports:

```ts
import { Button } from '@askrjs/ui/button';
import { Dialog } from '@askrjs/ui/dialog';
```

## See also

- [askr-ui docs README](./README.md)
- [askr-themes](https://github.com/askrjs/askr-themes/tree/main/docs/askr-themes.md)
