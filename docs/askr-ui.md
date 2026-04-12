# UI: askr-ui

`@askrjs/askr-ui` provides headless UI primitives for Askr applications.

## What askr-ui is

askr-ui implements interaction behavior and accessibility patterns. It does not impose any
visual styling. Pair it with `askr-themes` for visual defaults, or supply your own CSS.

## Component categories

| Category   | Components                                                                                                                          | Import path                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Foundation | Button, Toggle, Checkbox, VisuallyHidden, Separator, Label, Input, Textarea, Field, RadioGroup, Switch, Select, Slider, ToggleGroup | `@askrjs/askr-ui` or `@askrjs/askr-ui/primitives/*` |
| Focus      | FocusRing, FocusScope, DismissableLayer                                                                                             | `@askrjs/askr-ui` or `@askrjs/askr-ui/composites/*` |
| Overlay    | Dialog, AlertDialog, Popover, Tooltip, DropdownMenu, Menu                                                                           | `@askrjs/askr-ui` or `@askrjs/askr-ui/composites/*` |
| Disclosure | Accordion, Collapsible, Tabs                                                                                                        | `@askrjs/askr-ui` or `@askrjs/askr-ui/composites/*` |
| Status     | Badge, Progress, ProgressCircle, Toast, Skeleton, Spinner                                                                           | `@askrjs/askr-ui` or bucketed subpaths              |
| Identity   | Avatar                                                                                                                              | `@askrjs/askr-ui` or `@askrjs/askr-ui/primitives/*` |
| Navigation | Breadcrumb, Pagination, Menubar, NavigationMenu                                                                                     | `@askrjs/askr-ui` or `@askrjs/askr-ui/composites/*` |
| Layout     | Container, Flex, Grid, Spacer                                                                                                       | `@askrjs/askr-ui` or bucketed subpaths              |
| Patterns   | DataTable, SidebarLayout, TopbarLayout                                                                                              | `@askrjs/askr-ui` or bucketed subpaths              |

askr-ui has two component tiers. **Core** components (all rows above Patterns) are behavioral primitives and composites — minimal, composable, and free from pattern-driven complexity. **Pattern** components (`DataTable`, `SidebarLayout`, `TopbarLayout`) are higher-level compositions for common scenarios; they build on core but are not part of core. Pattern requirements must not drive API changes in core.

## Import style

Components are importable per-subpath for tree-shaking:

```ts
import { Button, Input, Field, Dialog, Menu } from '@askrjs/askr-ui';
import { Button } from '@askrjs/askr-ui/primitives/button';
import { Field } from '@askrjs/askr-ui/composites/field';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from '@askrjs/askr-ui/composites/dialog';
import { Menubar } from '@askrjs/askr-ui/composites/menubar';
import { NavigationMenu } from '@askrjs/askr-ui/composites/navigation-menu';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@askrjs/askr-ui/primitives/select';
```

## See also

- [Foundations](./foundations.md)
- [Components](./components.md)
- [Composition](./composition.md)
- [Styling: askr-themes](../styling/askr-themes.md)
