# UI: askr-ui

`@askrjs/ui` provides headless UI primitives for Askr applications.

## What askr-ui is

askr-ui implements interaction behavior and accessibility patterns. It does not impose any
visual styling. Pair it with `askr-themes` for visual defaults, or supply your own CSS.

## Component categories

| Category   | Components                                                                                                               | Import path       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| Foundation | Button, Toggle, Checkbox, VisuallyHidden, Label, Input, Textarea, Field, RadioGroup, Switch, Select, Slider, ToggleGroup | `@askrjs/ui` |
| Focus      | FocusRing, FocusScope, DismissableLayer                                                                                  | `@askrjs/ui` |
| Overlay    | Dialog, AlertDialog, Popover, Tooltip, DropdownMenu, Menu                                                                | `@askrjs/ui` |
| Disclosure | Accordion, Collapsible, Tabs                                                                                             | `@askrjs/ui` |
| Status     | Progress, ProgressCircle, Toast, Spinner                                                                                 | `@askrjs/ui` |
| Identity   | Avatar                                                                                                                   | `@askrjs/ui` |
| Navigation | Breadcrumb, NavLink, Pagination, Menubar, NavigationMenu                                                                 | `@askrjs/ui` |
| Patterns   | DataTable                                                                                                                | `@askrjs/ui` |

Visual-only composition and display components such as Box, Stack, Inline,
Grid, Container, Section, Spacer, Separator/Divider, Badge, Skeleton,
SidebarLayout, and TopbarLayout live in `@askrjs/themes`.

NavLink is the route-aware anchor for navbar-style current-page highlighting.

## Import style

Components are importable per-subpath for tree-shaking:

```ts
import { Button } from '@askrjs/ui';
import { Dialog, DialogTrigger, DialogContent } from '@askrjs/ui';
import { Button, Input, Field } from '@askrjs/ui';
import { Dialog, Menu } from '@askrjs/ui';
import { Menubar, NavigationMenu } from '@askrjs/ui';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@askrjs/ui';
```

## See also

- [Foundations](./foundations.md)
- [Components](./components.md)
- [Composition](./composition.md)
- [Styling: askr-themes](../styling/askr-themes.md)

