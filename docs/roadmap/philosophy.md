# askr-ui Philosophy

## Why Build Progressively?

askr-ui is being built across five milestones rather than shipping everything at once. This document explains why.

---

## Core Principles

### 1. Early Primitives First

**Principle:** Ship the building blocks before the buildings.

**Why:**

- Component libraries succeed or fail based on their **composition patterns**
- You can't validate composition until you build several components using it
- Getting Slot, Portal, and prop merging wrong means **every component is wrong**

**Example:**

- v0.1.0 ships **Slot** and validates it across Button, Dialog, Select, Menu
- If `asChild` is awkward, we learn it with 20 components, not 80
- Future components (v0.2.0+) benefit from proven patterns

**Anti-pattern:**
Shipping DataGrid in v0.1.0 before simpler components validate the library's patterns.

---

### 2. Headless Composability

**Principle:** Behavior and accessibility without visual opinions.

**Why:**

- askr-ui provides **state, events, and ARIA** — not styles
- Users wrap components with their own design system
- This only works if the API makes wrapping **easy**

**How progressiveness helps:**

- v0.1.0 proves **Slot** pattern works for wrapping
- v0.2.0 proves it scales to disclosure patterns (Accordion, Tabs)
- v0.3.0 proves it handles complex overlays (DatePicker, CommandPalette)
- v0.4.0 proves it works for layout (ResizablePanel, Card)

Each milestone **validates** that headless composition scales to new patterns.

---

### 3. A11y-Critical Components Before Convenience Components

**Principle:** Ship components people actually need before nice-to-haves.

**Why:**

- Focus, keyboard navigation, and screen reader support are **hard**
- Get these patterns right early before the API is locked in
- Developers need accessible foundations more than advanced widgets

**Progression:**

1. **v0.1.0:** Core a11y patterns (focus management, ARIA, keyboard handling)
2. **v0.2.0:** Navigation and disclosure (roving focus, tab lists)
3. **v0.3.0:** Rich input patterns (date pickers, comboboxes with proper ARIA)
4. **v0.4.0:** Complex keyboard navigation (tree views, listboxes)
5. **v0.5.0:** Advanced patterns build on proven a11y foundations

**Anti-pattern:**
Shipping TreeView (complex keyboard nav) before proving simpler roving focus in Menu.

---

### 4. Forms, Overlays, and Navigation Before Long-Tail Widgets

**Principle:** Enable real applications before adding specialized components.

**Why:**

- Every web application needs forms, dialogs, and navigation
- Specialized widgets (DataGrid, VirtualList, RichTextEditor) are **optional**
- Developers can build 80% of applications with the first 40% of components

**Validation strategy:**
| Milestone | Can Build | Proves |
|-----------|-----------|--------|
| v0.1.0 | Auth flows, settings screens, basic CRUD | Forms + overlays work |
| v0.2.0 | Dashboards, admin panels, docs sites | Navigation + disclosure work |
| v0.3.0 | Booking systems, CRM, internal tools | Advanced forms work |
| v0.4.0 | Data-heavy admin UIs, file explorers | Display + collections work |
| v0.5.0 | Enterprise apps, performance UIs | Advanced patterns work |

Each milestone produces **useful applications** that validate the library.

**Anti-pattern:**
Spending months perfecting a DataGrid that few apps need before shipping basic forms.

---

## How Each Milestone Validates Patterns

### v0.1.0 Validates Foundation Patterns

Components to ship:

- Slot, Portal, Presence, VisuallyHidden
- Button, Input, Textarea, Checkbox, RadioGroup, Switch
- Dialog, Popover, Tooltip
- Select, Menu, DropdownMenu

**What we learn:**
✅ Does Slot-based composition feel natural?  
✅ Does prop merging work for event handlers?  
✅ Do controlled/uncontrolled patterns scale?  
✅ Is overlay positioning robust?  
✅ Does focus management prevent bugs?  
✅ Are ARIA patterns consistent?

**If we discover problems:**

- Fix them before 60 more components inherit the mistake
- API changes are acceptable in v0.1.0 (pre-1.0)
- Better to break 20 components than 80

---

### v0.2.0 Validates Navigation Patterns

Components to ship:

- Accordion, Collapsible, Tabs
- Breadcrumb, Pagination, NavigationMenu, Menubar
- Toggle, ToggleGroup, Slider
- Badge, Avatar, Skeleton, Progress, Toast

**What we learn:**
✅ Does controlled expand/collapse work across components?  
✅ Does roving focus scale to tab lists and menu bars?  
✅ Can compound components (Accordion, Tabs) share internal context cleanly?  
✅ Do navigation patterns compose with v0.1.0 overlays?  
✅ Are disclosure patterns predictable?

**If we discover problems:**

- We fix navigation patterns before building on them in v0.3.0+
- v0.3.0's CommandPalette and DatePicker benefit from proven patterns

---

### v0.3.0 Validates Complex Input Patterns

Components to ship:

- NumberField, PinInput, Combobox, Autocomplete, CommandPalette
- DatePicker, Calendar, TimeField, RangeCalendar
- Fieldset, Form, InputGroup, SearchField
- HoverCard, ContextMenu, Sheet

**What we learn:**
✅ Does Combobox composition (Input + Popover + Menu) feel natural?  
✅ Can overlays handle complex positioning (Calendar, CommandPalette)?  
✅ Do multi-field inputs (PinInput, TimeField) have good UX?  
✅ Does form orchestration (validation, submission) work?  
✅ Are compound inputs (DatePicker = Input + Calendar + Popover) maintainable?

**If we discover problems:**

- We fix them before v0.4.0's DataGrid tries inline editing
- v0.5.0's InlineEditable benefits from proven input composition

---

### v0.4.0 Validates Display and Collection Patterns

Components to ship:

- Table, DataList, Listbox, TreeView
- EmptyState, Kbd, Stat, Card
- InlineAlert, Callout, Banner, Status
- AspectRatio, ScrollArea, ResizablePanel, Splitter

**What we learn:**
✅ Does Table handle selection, sorting, keyboard nav?  
✅ Can TreeView scale to deeply nested hierarchies?  
✅ Does Listbox roving focus work with hundreds of items?  
✅ Are layout primitives (ResizablePanel) composable?  
✅ Do collection patterns perform well?

**If we discover problems:**

- We fix collection patterns before v0.5.0's DataGrid and VirtualList
- Performance issues are caught and solved in simpler components first

---

### v0.5.0 Builds on Proven Foundations

Components to ship:

- Toolbar, RovingFocusGroup, Stepper, Tour
- Tray, FloatingToolbar
- DataGrid, VirtualList, Masonry
- LoadingOverlay, PendingBoundary, InlineEditable
- CommandBar, Sidebar, AppShell

**What we learn:**
✅ Does virtualization work with Askr's scheduler?  
✅ Can DataGrid compose all v0.1.0–v0.4.0 patterns?  
✅ Do performance optimizations maintain accessibility?  
✅ Are application shell primitives (AppShell, Sidebar) flexible?

**Why ship last:**

- DataGrid is complex — benefits from 4 milestones of pattern validation
- VirtualList is performance-critical — needs simple Listbox proven first
- Tour and Stepper need all overlay patterns stable
- AppShell composes everything — should be last, not first

---

## What Happens If We Ignore This?

### Scenario: Ship Everything in v0.1.0

**Problems:**

1. **No validation cycle:** You don't discover Slot problems until all 80 components exist
2. **Costly breaking changes:** Fixing prop merging breaks every component at once
3. **Wasted effort:** Complex components (DataGrid) get rewritten when patterns change
4. **Poor priorities:** Time spent on DataGrid instead of forms people actually need
5. **No useful releases:** Can't ship until all 80 components are done

**Result:**

- Either you ship broken patterns that can't change (locked in bad design)
- Or you delay for months while perfecting components few apps need

---

### Scenario: Ship DataGrid Before Table

**Problems:**

1. DataGrid is complex (sorting, filtering, grouping, inline editing, virtualization)
2. You haven't proven simpler Table patterns work yet
3. If you discover Table patterns are awkward, DataGrid has to be rewritten
4. Developers need basic Table more than enterprise DataGrid

**Result:**

- DataGrid API is unstable because Table patterns weren't validated
- Early adopters are frustrated by breaking changes
- Complex component becomes a maintenance burden

---

### Scenario: Ship DatePicker in v0.1.0

**Problems:**

1. DatePicker needs Popover positioning — not yet proven
2. DatePicker needs keyboard navigation — roving focus not validated
3. DatePicker needs Input composition — basic inputs not stable
4. If Popover positioning is awkward, DatePicker UX suffers

**Result:**

- DatePicker works poorly because overlay patterns aren't solid
- Users build workarounds instead of using the buggy component
- You rewrite DatePicker after v0.1.0 proves better overlay patterns

---

## The Progressive Advantage

### Development Benefits

✅ **Faster iteration** — validate patterns with 20 components, not 80  
✅ **Lower risk** — breaking changes affect fewer components early  
✅ **Better priorities** — essential components ship first  
✅ **Useful releases** — every milestone builds complete applications  
✅ **Compound learning** — each milestone informs the next

### User Benefits

✅ **Early access** — don't wait for v1.0 to ship 80 components  
✅ **Stable foundation** — v0.1.0 is battle-tested before v0.2.0 builds on it  
✅ **Real-world validation** — patterns proven in production before advancing  
✅ **Clear priorities** — know what's coming and when  
✅ **No dead weight** — no half-baked components shipped to hit arbitrary milestones

---

## Lessons from Other Libraries

### Radix UI → Progressive

- Started with primitives (Slot, Portal, Focus management)
- Added disclosure patterns (Accordion, Collapsible, Tabs)
- Then complex inputs (Select, Combobox)
- Finally advanced patterns (Navigation Menu, Context Menu)

**Result:** Stable, well-composed components.

### React Aria → Comprehensive Upfront

- Shipped 50+ components at once
- Complex patterns (Calendar, DataGrid) alongside simple ones
- Long development cycle before useful release

**Result:** High quality, but long wait for first release.

### shadcn/ui → Iterative

- Started with Button, Input, Dialog
- Validated composition patterns
- Added components based on community demand
- Complex components came after simple ones proven

**Result:** Rapid adoption, clear priorities.

---

## Summary

askr-ui's progressive approach:

1. **Validates patterns early** with simple components
2. **Ships useful applications** at each milestone
3. **Avoids costly rewrites** of complex components
4. **Prioritizes essential** over nice-to-have
5. **Builds confidence** with each release

The alternative — shipping everything at once — risks:

- Locked-in bad patterns
- Wasted effort on rarely-used components
- Long delays before useful releases
- Breaking changes across 80 components simultaneously

**Progressive development is slower to 100%, but faster to useful.**

---

Back to [Roadmap](../../ROADMAP.md)
