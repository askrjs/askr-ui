# askr-ui

`@askrjs/ui` provides headless UI primitives for Askr applications.

## What askr-ui is

askr-ui owns interaction behavior, state coordination, accessibility wiring,
and structural composition. It does not impose visual styling. Pair it with
`askr-themes` for default visuals, or supply your own CSS.

## Package shape

The package is organized into three documentation areas:

- [Foundations](./foundations.md) for low-level behavior contracts
- [Components](./components.md) for the public component surface
- [Composition](./composition.md) for examples that combine primitives

Use the package root for most application code:

```ts
import { Button, Dialog, DialogTrigger, DialogContent } from '@askrjs/ui';
```

## See also

- [askr-ui docs README](./README.md)
- [askr-themes](https://github.com/askrjs/askr-themes/tree/main/docs/askr-themes.md)
