# Components

Reference for the public `@askrjs/ui` surface.

## Surface model

The package exports a curated root surface and direct component subpaths.
Use the root package for everyday imports and subpaths when you want a single
family with a narrower surface.

```ts
import { Button, Checkbox, Input } from '@askrjs/ui';
import { Dialog, Popover, Tooltip } from '@askrjs/ui';
import { Dialog } from '@askrjs/ui/dialog';
```

Type names are family-shaped rather than globally uniform. Most families use
`OwnProps`, `Props`, and `AsChildProps` naming. Some host-bound families use a
host-specific suffix when the underlying element is part of the contract.

The source tree follows the same layout: each public family owns its own folder
under `src/components/`, and shared internals stay in
`src/components/_internal/`.

## Conceptual groupings

These are documentation groupings only.

| Group                      | Families                                                                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitives                 | Button, Checkbox, Input, Label, Form, Toggle, ToggleGroup, RadioGroup, Select, Slider, Switch, Table, Textarea, Progress, ProgressCircle, VisuallyHidden |
| Focus                      | FocusScope, DismissableLayer                                                                                                                             |
| Overlays                   | Dialog, AlertDialog, Popover, HoverCard, Tooltip, Dropdown, Menu                                                                                         |
| Disclosure                 | Accordion, Collapsible                                                                                                                                   |
| Status                     | Progress, ProgressCircle, Toast                                                                                                                          |
| Identity                   | Avatar                                                                                                                                                   |
| Navigation                 | Menubar, Navigation Menu                                                                                                                                 |
| Layout and layout-adjacent | Scroll Area                                                                                                                                              |
| Virtualization             | VirtualList, VirtualTable                                                                                                                                |

## Family notes

- AlertDialog is a Dialog specialization for blocking confirmations. Its action
  and cancel parts intentionally alias the same close behavior for
  compatibility.
- Toast is a stacked notification family. `ToastProvider` owns the registry,
  `ToastViewport` renders the stack, and `Toast` registers entries rather than
  rendering standalone DOM.
- Select uses `SelectItemText` as the text slot used by `SelectItem` for
  labeling and styling.
- `DebouncedInput` wraps `Input` for search and filter surfaces that need a
  settled value callback.
- `ToastAction` closes a toast after a custom user action; `ToastClose` is the
  explicit dismiss control.
- `AlertDialogAction` and `AlertDialogCancel` intentionally alias
  `DialogClose` for confirmation-dialog compatibility.
- `VirtualList` is a fixed-height list windowing primitive with stable keys,
  anchor correction, and optional follow-bottom behavior.
- `VirtualTable` is a fixed-height table windowing primitive with a sticky
  head, stable keys, selection, and keyboard navigation.

## Virtualization

```ts
import { VirtualList, VirtualTable } from '@askrjs/ui';
import { VirtualList as VirtualListSubpath } from '@askrjs/ui/virtual-list';
import { VirtualTable as VirtualTableSubpath } from '@askrjs/ui/virtual-table';
```

`VirtualList` keeps list rendering headless while the caller supplies the row
component. `VirtualTable` keeps the semantic table structure intact while the
caller supplies column metadata and cell renderers.

## See also

- [askr-ui](./askr-ui.md)
- [Composition](./composition.md)
