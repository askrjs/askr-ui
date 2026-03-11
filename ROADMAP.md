# askr-ui Roadmap

## Overview

askr-ui is being built progressively across five major milestones, each enabling increasingly complex application patterns while validating the library's core design.

**Release Philosophy:**

- **Early primitives first** — establish composition patterns before building on them
- **Headless composability** — behavior and accessibility without visual opinions
- **A11y-critical components before convenience** — accessible foundations enable everything else
- **Forms, overlays, and navigation before long-tail widgets** — enable real apps early

Each milestone builds on the previous, expanding capabilities without breaking existing patterns.

---

## Milestones

### [v0.1.0 — Foundations](docs/roadmap/v0.1.0-foundations.md)

**Status:** In Progress  
**Target:** Basic interactive apps with forms and overlays

**What you can build:**

- Sign-up and login forms
- Settings screens
- Modal confirmation flows
- Todo lists and task managers
- Basic CRUD interfaces

**Components:** 15 UI components  
Button (✅ shipped), Checkbox (✅ shipped), Input (✅ shipped), Textarea (✅ shipped), Label (✅ shipped), VisuallyHidden (✅ shipped), Separator (✅ shipped), RadioGroup (✅ shipped), Switch (✅ shipped), Field (✅ shipped), Dialog, AlertDialog, Popover, Tooltip, Select, Menu, DropdownMenu, FocusRing, FocusScope, DismissableLayer

**Uses existing foundations:**  
Slot, Portal, Presence, pressable(), focusable(), hoverable(), dismissable(), rovingFocus(), mergeProps, controllableState, Collection, Layer (all from `@askrjs/askr/foundations`)

**Why this milestone:**  
Validates Slot-based composition, prop merging, controlled/uncontrolled state, and accessibility patterns. Provides enough surface area to build real applications and prove the library's approach works.

---

### [v0.2.0 — Navigation and Disclosure](docs/roadmap/v0.2.0-navigation.md)

**Status:** Planned  
**Target:** App shells, dashboards, admin panels, documentation layouts

**What you can build:**

- Multi-page dashboards with navigation
- Settings panels with tabbed sections
- Documentation sites with expandable sections
- Admin panels with filtered lists and pagination
- Feature announcements with toast notifications

**Components:** 15  
Accordion, Collapsible, Tabs, Breadcrumb, Pagination, NavigationMenu, Menubar, Badge, Avatar, Skeleton, Spinner, Progress, Toast, Toggle, ToggleGroup, Slider

**Why this milestone:**  
Adds common app shell patterns and page-level navigation. Builds on v0.1.0's form and overlay foundation to enable complete application layouts. Introduces disclosure patterns (accordions, tabs, collapsibles) that many apps need.

---

### [v0.3.0 — Data Entry and Rich Forms](docs/roadmap/v0.3.0-forms.md)

**Status:** Planned  
**Target:** Serious CRUD apps, internal tools, workflows with rich validation

**What you can build:**

- Advanced data entry forms with date/time pickers
- Search interfaces with autocomplete
- Command palettes for power users
- Booking and scheduling interfaces
- Complex multi-step workflows

**Components:** 14  
NumberField, PinInput, Combobox, Autocomplete, CommandPalette, DatePicker, Calendar, TimeField, RangeCalendar, Fieldset, Form, InputGroup, SearchField, HoverCard, ContextMenu, Sheet

**Why this milestone:**  
Moves beyond basic inputs to enable complex data entry workflows. Combobox and CommandPalette add keyboard-driven power user interactions. Date/time pickers complete the form control story for most business applications.

---

### [v0.4.0 — Collections and Data Display](docs/roadmap/v0.4.0-data.md)

**Status:** Planned  
**Target:** Complex admin UIs, explorer-style interfaces, information-dense applications

**What you can build:**

- Data tables with sorting and selection
- File explorers and tree navigation
- Status dashboards with metrics
- Document viewers with hierarchical outlines
- Split-pane editing interfaces

**Components:** 15  
Table, DataList, Listbox, TreeView, NestedMenu, EmptyState, Kbd, Stat, Card, InlineAlert, Callout, Banner, Status, AspectRatio, ScrollArea, ResizablePanel, Splitter

**Why this milestone:**  
Complements v0.3.0's form-heavy focus with data display and hierarchical navigation. Enables information-dense interfaces where reading and browsing data is as important as entering it. Layout helpers (ResizablePanel, ScrollArea) support complex application shells.

---

### [v0.5.0 — Advanced Patterns and Polish](docs/roadmap/v0.5.0-advanced.md)

**Status:** Planned  
**Target:** Enterprise interfaces, performance-critical UIs, advanced keyboard navigation

**What you can build:**

- Rich text editors with floating toolbars
- Data grids with virtualization for thousands of rows
- Onboarding flows with product tours
- Command-driven interfaces with keyboard shortcuts
- Complex application shells with sidebars and panels

**Components:** 15+  
Toolbar, RovingFocusGroup, Stepper, Tour, Tray, FloatingToolbar, DataGrid, VirtualList, Masonry, LoadingOverlay, PendingBoundary, InlineEditable, CommandBar, Sidebar, AppShell

**Why this milestone:**  
Maturity release focused on advanced interaction patterns, performance optimization, and complete application scaffolding. Only ships after core patterns are proven in v0.1.0–v0.4.0. Includes components that are "nice to have" rather than essential, and those that could expose API weaknesses if shipped too early (DataGrid, virtualization).

---

## Recommended Adoption Path

### Start with v0.1.0

If you're building a **new application**, v0.1.0 provides the essentials:

- ✅ Forms and validation
- ✅ Modal dialogs and popovers
- ✅ Dropdowns and selections
- ✅ Accessible by default

**You can build:** signup flows, settings screens, basic CRUD interfaces, todo apps

### Add v0.2.0 for navigation

When you need **application structure**:

- ✅ Multi-page navigation
- ✅ Tabbed interfaces
- ✅ Collapsible sections
- ✅ Loading states and feedback

**You can build:** dashboards, admin panels, documentation sites, settings panels

### Add v0.3.0 for complex forms

When you need **advanced data entry**:

- ✅ Date and time pickers
- ✅ Autocomplete and search
- ✅ Command palettes
- ✅ Multi-step workflows

**You can build:** booking systems, scheduling apps, CRM interfaces, internal tools

### Add v0.4.0 for data display

When you need **information density**:

- ✅ Data tables
- ✅ Tree navigation
- ✅ Metrics and stats
- ✅ Resizable layouts

**You can build:** analytics dashboards, file explorers, reporting interfaces, monitoring UIs

### Add v0.5.0 for polish

When you need **enterprise features**:

- ✅ Virtualized collections
- ✅ Advanced toolbars
- ✅ Onboarding flows
- ✅ Complete app shells

**You can build:** rich editors, data-heavy admin UIs, complex SPAs, desktop-class web apps

---

## What to Avoid Shipping Too Early

These components are **intentionally** delayed until later milestones because they can expose API weaknesses if patterns aren't proven first:

- ❌ **DataGrid** (v0.5.0) — complex API surface, test Table patterns first
- ❌ **DatePicker** (v0.3.0) — wait until overlay and input patterns are stable
- ❌ **Combobox** (v0.3.0) — needs Select patterns validated first
- ❌ **TreeView** (v0.4.0) — requires roving focus patterns proven in menus
- ❌ **VirtualList** (v0.5.0) — performance patterns should build on proven collection components
- ❌ **CommandPalette** (v0.3.0) — wait for keyboard navigation patterns to mature
- ❌ **ResizablePanel** (v0.4.0) — layout primitives should come after content components

---

## Component Count Summary

| Milestone | UI Components | Cumulative |
| --------- | ------------- | ---------- |
| v0.1.0    | 15            | 15         |
| v0.2.0    | 15            | 30         |
| v0.3.0    | 14            | 44         |
| v0.4.0    | 15            | 59         |
| v0.5.0    | 15+           | 74+        |

**Note:** All milestones use existing primitives from `@askrjs/askr/foundations` (Slot, Portal, Presence, interaction primitives, prop utilities, state management).

See [component-audit.md](docs/roadmap/component-audit.md) for detailed differentiation between similar components.

---

## Release Schedule

askr-ui follows a **quality-over-speed** approach:

- **v0.1.0** must be extremely tight — only components that define long-term patterns
- **v0.2.0–v0.3.0** broaden carefully — components most apps actually need
- **v0.4.0–v0.5.0** ship only after foundations are proven

Each milestone is **feature-complete** and **production-ready** for its target use cases.

---

## Contributing

See detailed milestone documentation in [docs/roadmap/](docs/roadmap/) for:

- Component specifications
- Accessibility requirements
- Implementation priorities
- Example use cases

For library design philosophy, see [docs/roadmap/philosophy.md](docs/roadmap/philosophy.md).

For technical architecture, see [RULES.md](RULES.md) and [SPEC.md](SPEC.md).
