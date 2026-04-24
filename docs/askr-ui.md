# UI: askr-ui

`@askrjs/askr-ui` provides headless UI primitives for Askr applications.

## What askr-ui is

askr-ui implements interaction behavior and accessibility patterns. It does not impose any
visual styling. Pair it with `askr-themes` for visual defaults, or supply your own CSS.

## Component categories

| Category   | Components                                                                                                                          | Import path       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Foundation | Button, Toggle, Checkbox, VisuallyHidden, Separator, Label, Input, Textarea, Field, RadioGroup, Switch, Select, Slider, ToggleGroup | `@askrjs/askr-ui` |
| Focus      | FocusRing, FocusScope, DismissableLayer                                                                                             | `@askrjs/askr-ui` |
| Overlay    | Dialog, AlertDialog, Popover, Tooltip, DropdownMenu, Menu                                                                           | `@askrjs/askr-ui` |
| Disclosure | Accordion, Collapsible, Tabs                                                                                                        | `@askrjs/askr-ui` |
| Status     | Badge, Progress, ProgressCircle, Toast, Skeleton, Spinner                                                                           | `@askrjs/askr-ui` |
| Identity   | Avatar                                                                                                                              | `@askrjs/askr-ui` |
| Navigation | Breadcrumb, Pagination, Menubar, NavigationMenu                                                                                     | `@askrjs/askr-ui` |
| Layout     | Box, Container, Flex, Grid, Section, Spacer                                                                                         | `@askrjs/askr-ui` |
| Patterns   | DataTable, SidebarLayout, TopbarLayout                                                                                              | `@askrjs/askr-ui` |

## Import style

Components are importable per-subpath for tree-shaking:

```ts
import { Button } from '@askrjs/askr-ui';
import { Dialog, DialogTrigger, DialogContent } from '@askrjs/askr-ui';
import { Button, Input, Field } from '@askrjs/askr-ui';
import { Dialog, Menu } from '@askrjs/askr-ui';
import { Menubar, NavigationMenu } from '@askrjs/askr-ui';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@askrjs/askr-ui';
```

## See also

- [Foundations](./foundations.md)
- [Components](./components.md)
- [Composition](./composition.md)
- [Styling: askr-themes](../styling/askr-themes.md)
