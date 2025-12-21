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

### Foundations

- Slot / AsChild
- Presence
- FocusScope
- FocusTrap
- RovingFocus
- DismissableLayer
- Portal
- VisuallyHidden
- Id / Label / Description helpers
- Keyboard intent helpers

---

### Inputs & Controls

- Button
- Toggle / ToggleGroup
- Checkbox
- Radio / RadioGroup
- Switch
- TextInput
- TextArea
- Select (Listbox)
- Combobox
- Slider
- RangeSlider
- NumberInput
- FileInput

---

### Overlays

- Dialog / Modal
- AlertDialog
- Popover
- Tooltip
- HoverCard
- Drawer / Sheet
- ContextMenu

---

### Navigation & Disclosure

- Accordion
- Collapsible
- Tabs
- Menu / MenuBar
- DropdownMenu
- NavigationMenu
- Breadcrumbs (logic only)

---

### Data Display

- Table (headless)
- DataGrid (advanced)
- Listbox
- TreeView
- VirtualList
- Pagination
- InfiniteScroll controller

---

### Feedback & Status

- Toast (headless store + lifecycle)
- Progress
- Spinner (logic only)
- Skeleton (presence + timing)
- Badge (semantics only)

---

### Forms

- Form
- Field
- Fieldset
- Label
- ErrorMessage
- HelpText
- Validation orchestration (sync + async)

---

### Advanced Primitives

- Command / CommandPalette
- Typeahead
- Autocomplete
- DragAndDrop (minimal, extensible)
- ResizeObserver primitive
- IntersectionObserver primitive
- ScrollArea (logic only)

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
