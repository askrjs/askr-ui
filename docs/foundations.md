# Foundations

`@askrjs/askr/foundations` is the shared helper layer used by `askr-ui` and
other Askr packages that need the same low-level composition behavior.

Import it directly from the runtime package:

```ts
import {
  Slot,
  composeHandlers,
  composeRefs,
  controllableState,
  formatId,
  mergeProps,
} from '@askrjs/askr/foundations';
```

## What it is for

Use the foundations layer when you need reusable implementation helpers that
should stay consistent across packages:

- `mergeProps` combines runtime props without dropping caller intent
- `composeHandlers` and `composeRefs` keep event and ref composition stable
- `controllableState` coordinates controlled and uncontrolled state shapes
- `formatId` keeps deterministic IDs aligned with the runtime contract
- `Slot` lets components preserve caller markup without forcing DOM structure

These helpers are implementation tools, not the primary package surface for
application code. App code should normally reach for `@askrjs/ui` or
`@askrjs/themes` instead of importing foundations directly.

## Boundary

`askr-ui` depends on this layer, but it does not own it.

- Runtime and shared helpers live in `@askrjs/askr`
- Behavioral components live in `@askrjs/ui`
- Visual wrappers and theme CSS live in `@askrjs/themes`

When a change needs new foundation behavior, it belongs in the runtime package
and should be verified there first.
