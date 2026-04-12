# UI: Components

Reference for all `@askrjs/askr-ui` components.

> The root entrypoint exposes the full public surface. Bucketed subpaths remain available
> when you want the narrowest possible import.

## Foundation components

```ts
import {
  Button,
  Checkbox,
  Field,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
  Separator,
  Slider,
  Switch,
  Textarea,
  Toggle,
  ToggleGroup,
  VisuallyHidden,
} from '@askrjs/askr-ui';
```

## Focus components

```ts
import { DismissableLayer, FocusRing, FocusScope } from '@askrjs/askr-ui';
```

## Overlay components

```ts
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogClose,
} from '@askrjs/askr-ui';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
} from '@askrjs/askr-ui';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
} from '@askrjs/askr-ui';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@askrjs/askr-ui';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@askrjs/askr-ui';
import { Menu, MenuContent, MenuItem } from '@askrjs/askr-ui';
```

## Disclosure components

```ts
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@askrjs/askr-ui';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@askrjs/askr-ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@askrjs/askr-ui';
```

## Status components

```ts
import {
  Badge,
  Spinner,
  Skeleton,
  Progress,
  ProgressCircle,
  Toast,
  ToastProvider,
} from '@askrjs/askr-ui';
```

## Identity components

```ts
import { Avatar } from '@askrjs/askr-ui';
```

## Navigation components

```ts
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@askrjs/askr-ui';
import {
  Pagination,
  PaginationItem,
  PaginationPrev,
  PaginationNext,
} from '@askrjs/askr-ui';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from '@askrjs/askr-ui';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from '@askrjs/askr-ui';
```

## Layout primitives

```ts
import {
  Container,
  Flex,
  Grid,
  Spacer,
} from '@askrjs/askr-ui';
```

## Pattern components

```ts
import {
  DataTable,
  SidebarLayout,
  TopbarLayout,
} from '@askrjs/askr-ui';
```

## See also

- [askr-ui overview](./askr-ui.md)
- [Composition](./composition.md)
- [Styling](../styling/askr-themes.md)
