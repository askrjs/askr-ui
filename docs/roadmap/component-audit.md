# askr-ui Component Audit

## Purpose

Ensure every component in the roadmap has a distinct, long-term purpose with no planned deprecations.

---

## Component Differentiation

### Similar-Named Components

| Component A | Component B | Distinction | Status |
|-------------|-------------|-------------|---------|
| **Menu** | **DropdownMenu** | Menu = navigation menus (app/site nav), DropdownMenu = action menus triggered by buttons | ✅ Keep both |
| **Toggle** | **Switch** | Toggle = button-like pressed state (aria-pressed), Switch = iOS-style toggle control (role=switch) | ✅ Keep both |
| **Select** | **Combobox** | Select = simple dropdown (native-like), Combobox = searchable/filterable selection with autocomplete | ✅ Complementary |
| **Progress** | **Spinner/ProgressCircle** | Progress = linear progress bar, Spinner/ProgressCircle = circular/radial indicator for indeterminate states | ✅ Keep both |
| **Tooltip** | **HoverCard** | Tooltip = simple text label on hover (WCAG compliant), HoverCard = rich interactive content on hover | ✅ Keep both |
| **Badge** | **Status/Tag** | Badge = notification counts/indicators, Status/Tag = status labels/categorical markers | ✅ Keep both |
| **Callout** | **InlineAlert** | Callout = emphasized content blocks (tips, warnings in docs), InlineAlert = inline validation/error messages in forms | ✅ Keep both |
| **Dialog** | **AlertDialog** | Dialog = general modal dialogs, AlertDialog = specific pattern for alerts/confirmations with semantic roles | ✅ Keep both |
| **Menu** | **ContextMenu** | Menu = explicit menus, ContextMenu = right-click/long-press contextual menus | ✅ Keep both |
| **Popover** | **HoverCard** | Popover = click-to-open positioned content, HoverCard = hover-triggered rich content with delay | ✅ Keep both |
| **Collapsible** | **Accordion** | Collapsible = single expandable region, Accordion = multiple collapsible panels with single-select behavior | ✅ Keep both |

### Compound Names (Single Component)

| Component Name | Aliases | Clarification |
|----------------|---------|---------------|
| **Sheet / Drawer** | Same component | Sheet and Drawer are the same pattern - slide-in panel from edge of screen |
| **Command / CommandPalette** | Same component | Command is shorthand, CommandPalette is the full name |
| **PinInput / OTPInput** | Same component | OTPInput is specific use case of PinInput pattern |
| **Stat / Metric** | Same component | Stat and Metric refer to the same numeric display component |
| **Spinner / ProgressCircle** | Same component in v0.2.0 | Listed as "Spinner/ProgressCircle" - single circular progress component |
| **HelperText / ErrorText** | Related utilities | May be single Field component with variants, or separate utilities |

---

## Component Count by Milestone

### v0.1.0 — Foundations (20 components)
### v0.1.0 — Foundations (15 UI components)
- **Core utilities**: VisuallyHidden, Separator, FocusRing (3)
- **Interaction wrappers**: Button, FocusScope, DismissableLayer (3)
- **Form controls**: Label, Input, Textarea, Checkbox, RadioGroup, Switch, Field (7)
- **Overlays**: Dialog, AlertDialog, Popover, Tooltip (4)
- **Selection**: Select, Menu, DropdownMenu (3)

**Total: 24 distinct components** (HelperText/ErrorText may be part of Field)
**Total: 15 UI components** (HelperText/ErrorText may be part of Field)

**Note:** Slot, Portal, Presence, pressable(), focusable(), hoverable(), dismissable(), rovingFocus(), mergeProps, controllableState, Collection, Layer are available from `@askrjs/askr/foundations` and not counted as components to build.

### v0.2.0 — Navigation (15 components)
- **Disclosure**: Accordion, Collapsible, Tabs (3)
- **Navigation**: Breadcrumb, Pagination, NavigationMenu, Menubar (4)
- **Feedback**: Badge, Avatar, Skeleton, ProgressCircle (Spinner), Progress, Toast (6)
- **Input**: Toggle, ToggleGroup, Slider (3)

**Total: 16 distinct components**

### v0.3.0 — Forms (14 components)
- **Advanced input**: NumberField, PinInput, Combobox, Autocomplete, CommandPalette, DatePicker, Calendar, TimeField, RangeCalendar (9)
- **Form structure**: Fieldset, Form, InputGroup, SearchField (4)
- **Overlays**: HoverCard, ContextMenu, Sheet (3)

**Total: 16 distinct components**

### v0.4.0 — Data (15 components)
- **Data display**: Table, DataList, Listbox, EmptyState, Kbd, Stat, Card (7)
- **Hierarchical**: TreeView, NestedMenu (2)
- **Feedback**: InlineAlert, Callout, Banner, Status (4)
- **Layout**: AspectRatio, ScrollArea, ResizablePanel, Splitter (4)

**Total: 17 distinct components**

### v0.5.0 — Advanced (16+ components)
- **Interaction**: Toolbar, RovingFocusGroup, Stepper, Tour (4)
- **Overlays**: Tray, FloatingToolbar (2)
- **Collections**: DataGrid, VirtualList, Masonry (3)
- **Async UX**: LoadingOverlay, PendingBoundary, InlineEditable (3)
- **App primitives**: CommandBar, Sidebar, AppShell (3)

**Total: 15+ distinct components**

**Grand Total: ~74 UI components across 5 milestones**

**Plus foundations:** 12+ primitives from `@askrjs/askr/foundations` available to all components

---

## Audit Conclusion

✅ **All components have distinct, long-term purposes**
✅ **No components will be deprecated by later additions**
✅ **Similar-named components serve different use cases**
✅ **Component differentiation is clear and documented**

The roadmap is ready for documentation.
