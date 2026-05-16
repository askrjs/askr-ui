# Foundations

`@askrjs/askr/foundations` provides the low-level runtime helpers used to
build headless components.

## Role

Foundations are implementation tools, not the application-facing API.
They exist to keep composition behavior consistent across packages.

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

## Common helpers

- `Slot` preserves caller markup without forcing DOM structure
- `mergeProps` combines props while preserving caller intent
- `composeHandlers` and `composeRefs` keep event and ref composition stable
- `controllableState` standardizes controlled and uncontrolled state patterns
- `formatId` keeps deterministic ids aligned with runtime expectations

## When to use it

Use foundations only when you are implementing components or shared runtime
behavior. Application code should normally import from `@askrjs/ui` or
`@askrjs/themes` instead.

## Ownership boundary

- `@askrjs/askr` owns the shared runtime and helper layer
- `@askrjs/ui` owns behavior, accessibility, and composition
- `@askrjs/themes` owns visual wrappers, layout, and styling

If a change requires a new helper, it belongs in the runtime package and must
be validated there before it is consumed by component packages.
