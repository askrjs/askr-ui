# askr-ui docs

This directory contains the source material for the public docs site.
It is intentionally concise, opinionated, and aligned to the shipped package
surface.

## What lives here

- [Overview](./askr-ui.md) - package purpose, ownership, and entrypoints
- [Foundations](./foundations.md) - shared runtime helpers used by askr-ui
- [Components](./components.md) - public component families and export notes
- [Composition](./composition.md) - common composition patterns and examples
- [Gap analysis](./ownership-gap-analysis.md) - ownership boundaries and backlog

## Package summary

`@askrjs/ui` provides headless UI primitives for Askr applications. It owns
behavior, state coordination, accessibility wiring, and slot-based
composition. It does not own visual styling.

Use `@askrjs/ui` for application code and `@askrjs/askr/foundations` for
shared runtime helpers that are part of the implementation contract.

## Quick start

```bash
npm install @askrjs/ui @askrjs/askr
```

```tsx
import { Button, Dialog, DialogContent, DialogTrigger } from '@askrjs/ui';
```

For larger surfaces, use grouped imports from the root package and direct
component subpaths when you want one component at a time.

```tsx
import { Checkbox, Input, Label } from '@askrjs/ui';
import { Dialog } from '@askrjs/ui/dialog';
```
