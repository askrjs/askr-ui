# askr-ui — SPEC

## Overview

**askr-ui** is the unstyled, headless UI component library for **Askr**.

It provides **behavior, state, and accessibility** primitives only.
No styles. No layout. No themes. No opinions.

askr-ui components are designed to be:

- Deterministic
- Scheduler-aware
- Accessible by default
- Composable into any design system

Styling and visual composition live in **askr-kit** (or user land).

---

## Goals

1. Provide a **complete set of headless UI primitives** needed to build modern applications.
2. Encode **correct interaction behavior** once, centrally.
3. Align strictly with **Askr runtime semantics** (single-mailbox, transactional updates).
4. Make wrapping components trivial for:
   - Tailwind
   - CSS Modules
   - Design systems
   - Custom renderers

---

## Non-Goals

askr-ui explicitly does **not** provide:

- Styling or CSS
- Animations or transitions
- Layout components (Card, Stack, Grid)
- Icons or visual assets
- Theme tokens
- Opinionated UX patterns

---

## Design Principles

### 1. Headless by Default

Components expose:

- State
- Events
- ARIA attributes
- Keyboard behavior

Rendering is delegated to the consumer.

---

### 2. Deterministic Behavior

- No hidden async
- No timing-based side effects
- All updates flow through the Askr scheduler
- Predictable mount / unmount semantics

---

### 3. Accessibility First

Every component:

- Has a defined ARIA contract
- Supports keyboard navigation
- Exposes labeling and description hooks
- Supports reduced-motion and screen reader needs

Accessibility is **not optional** or layered on later.

---

### 4. Composability

Components must:

- Work standalone
- Compose with other askr-ui primitives
- Allow partial adoption (use only what you need)
- Avoid deep inheritance or rigid hierarchies

---

## Component Inventory

### Current Status

- ✅ **Button** — Complete (v0.0.1)
- ✅ **Toggle** — Complete (v0.0.1)
- ✅ **Checkbox** — Exported
- ✅ **VisuallyHidden** — Exported
- ✅ **Separator** — Exported
- ✅ **Label** — Exported
- ✅ **Input** — Exported
- ✅ **Textarea** — Exported
- ✅ **Field** — Exported
- ✅ **RadioGroup** — Exported
- ✅ **Switch** — Exported
- 🚧 **Collapsible** — Present in source but intentionally deferred and not exported

### Planned Components

askr-ui will include **70+ UI components** organized across five milestones:

| Milestone                                                   | Components | Target                                          |
| ----------------------------------------------------------- | ---------- | ----------------------------------------------- |
| **[v0.1.0](ROADMAP.md#v010--foundations)**                  | 15         | Basic interactive apps with forms and overlays  |
| **[v0.2.0](ROADMAP.md#v020--navigation-and-disclosure)**    | 15         | App shells, dashboards, admin panels            |
| **[v0.3.0](ROADMAP.md#v030--data-entry-and-rich-forms)**    | 14         | CRUD apps, internal tools, rich validation      |
| **[v0.4.0](ROADMAP.md#v040--collections-and-data-display)** | 15         | Complex admin UIs, explorer interfaces          |
| **[v0.5.0](ROADMAP.md#v050--advanced-patterns-and-polish)** | 15+        | Enterprise interfaces, performance-critical UIs |

**See [ROADMAP.md](ROADMAP.md) for the complete component list, implementation priorities, and milestone details.**

**Note:** All components use existing primitives from `@askrjs/askr/foundations`: Slot, Portal, Presence, pressable(), focusable(), hoverable(), dismissable(), rovingFocus(), mergeProps, controllableState, Collection, Layer.

### Component Categories

The complete library will include:

- **Core Primitives** — Slot, Portal, Presence, VisuallyHidden, Separator
- **Interaction Foundations** — Button, Pressable, FocusRing, FocusScope, DismissableLayer
- **Form Controls** — Input, Textarea, Checkbox, RadioGroup, Switch, Select, NumberField, DatePicker, Combobox, etc.
- **Overlays** — Dialog, AlertDialog, Popover, Tooltip, HoverCard, ContextMenu, Sheet
- **Navigation** — Accordion, Tabs, Breadcrumb, Pagination, NavigationMenu, Menubar
- **Data Display** — Table, DataGrid, TreeView, Listbox, DataList
- **Feedback & Status** — Toast, Progress, Skeleton, Badge, Avatar, InlineAlert, Callout, Banner
- **Layout Helpers** — AspectRatio, ScrollArea, ResizablePanel, Splitter
- **Advanced Patterns** — CommandPalette, VirtualList, RovingFocusGroup, Toolbar, AppShell

---

## Implementation Notes

### Foundation Architecture

The current `pressable` foundation from `@askrjs/askr/foundations` is optimized for button-like semantics:

- Applies `role="button"`
- Handles Enter/Space keyboard activation
- Manages disabled state and aria-disabled
- Perfect for: Button, Toggle, and button-like controls

**Components blocked pending foundation work:**

- **Checkbox**: Requires `role="checkbox"` and `aria-checked` (not `aria-pressed`)
- **Switch**: Requires `role="switch"` and `aria-checked` (not `aria-pressed`)
- **Radio**: Requires `role="radio"` and roving tab index patterns

### Next Steps

1. **Architectural Decision**: Define additional foundation primitives
   - `checkable` foundation for checkbox/radio/switch semantics
   - `tabbable` foundation for roving tabindex patterns
2. **Component Priorities**: Focus on components that fit current foundations:
   - ToggleGroup (extends Toggle)
   - Collapsible (uses button trigger)
   - Accordion (uses button triggers)
   - Dialog system (uses button triggers)

3. **Testing Infrastructure**: All components require:
   - Behavior tests (`.behavior.test.tsx`)
   - Accessibility tests with axe (`.a11y.test.tsx`)
   - Determinism tests (`.determinism.test.tsx`)
   - Benchmarks (`.bench.tsx`)
   - Compile-time type tests (`tests/types/*.test.ts`)

---

## Public API Rules

A component **may only** expose:

- State accessors
- Event handlers
- ARIA attributes
- Refs / element bindings
- Controlled + uncontrolled modes

A component **must not**:

- Mutate the DOM outside its scope
- Implicitly style elements
- Depend on global CSS
- Leak internal scheduler details

---

## Testing & Invariants

Each component must have:

- Behavioral tests (mouse, keyboard, focus)
- Accessibility assertions
- Determinism tests (repeatable outcomes)
- Scheduler interaction coverage

No component is admitted without:

- A documented interaction model
- A defined ARIA contract
- Passing invariant tests

---

## Versioning Strategy

- **v1**: Core primitives and common components
- **v2**: Advanced data + power-user primitives
- **v3**: High-level orchestration helpers

Breaking changes are avoided unless:

- Accessibility is improved
- Determinism is strengthened
- Incorrect behavior is fixed

---

## Relationship to Other Packages

- **askr**: Runtime and scheduler
- **askr-ui**: Headless UI primitives (this package)
- **askr-kit**: Styled, opinionated components built on askr-ui

---

## Success Criteria

askr-ui is successful if:

- Most apps need **zero custom interaction logic**
- Accessibility bugs are rare and centralized
- Design systems can wrap components without friction
- Behavior remains predictable under load and stress

---

## Current Status (January 2026)

### ✅ Completed & Exported (10 components)

1. **Button** — Full implementation
   - Behavior tests: 27 tests passing
   - Accessibility tests: 20 tests passing (with axe)
   - Determinism tests: 14 tests passing
   - Benchmarks: 8 benches
   - Supports native `<button>` and `asChild` polymorphism
   - Uses `pressable` foundation for interaction

2. **Toggle** — Full implementation
   - Behavior tests: 21 tests passing
   - Accessibility tests: 22 tests passing (with axe)
   - Determinism tests: 15 tests passing
   - Benchmarks: 5 benches
   - Supports `aria-pressed` toggle semantics
   - Uses `pressable` foundation for interaction

3. **Checkbox** — Exported

- Native-first checkbox API with `asChild` support
- Behavior, accessibility, and determinism tests passing
- Package exports added

4. **VisuallyHidden** — Exported

- Structural accessibility utility

5. **Separator** — Exported

- Semantic divider with decorative mode

6. **Label** — Exported

- Thin labeling primitive with `asChild` support

7. **Input** / **Textarea** — Exported

- Native-first text entry wrappers with focusable semantics

8. **Field** — Exported

- Headless field metadata and ARIA association wrapper

9. **RadioGroup** — Exported

- Controlled/uncontrolled single-selection group

10. **Switch** — Exported

- Checked-state control with switch semantics

### 🚧 Partially Implemented (not exported)

- **Collapsible** — implementation deferred
  - Source and test suites exist
  - Not exported
  - Still blocked on compound-state/context architecture work

### ⏳ Not Yet Started

All other components in the inventory (see Component Inventory section above).

---

## Summary

**What's working:**

- Foundation architecture with `pressable` works excellently for button-like controls
- Test infrastructure is solid (behavior + a11y + determinism + benches)
- Component patterns are consistent and maintainable
- Export policy ensures only production-ready components are public

**What's next:**

- Define `checkable` foundation for checkbox/radio/switch patterns
- Implement ToggleGroup (extends Toggle pattern)
- Begin work on Disclosure components (Collapsible, Accordion)
- Set up Dialog system components

**Key insight:**
Not all interactive elements map to button semantics. The library needs multiple foundation primitives to support the full ARIA pattern library while maintaining the same quality standards established by Button and Toggle.
