# UI: Components

Reference for all `@askrjs/ui` components.

> The package root re-exports the public surface. Narrower imports remain available
> through the published `primitives/*`, `composites/*`, and `patterns/*` subpaths.

## Foundation components

```ts
import {
  Button,
  Checkbox,
  DebouncedInput,
  Field,
  FieldCheckbox,
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldRow,
  FieldRadioGroup,
  FieldSelectTrigger,
  FieldSwitch,
  FieldTextarea,
  FieldInput,
  Fieldset,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectGroup,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Slider,
  SliderTrack,
  SliderRange,
  SliderThumb,
  Switch,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  VisuallyHidden,
} from '@askrjs/ui';
```

## Focus components

```ts
import { DismissableLayer, FocusRing, FocusScope } from '@askrjs/ui';
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
} from '@askrjs/ui';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@askrjs/ui';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
  PopoverClose,
} from '@askrjs/ui';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
} from '@askrjs/ui';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@askrjs/ui';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuGroup,
  MenuLabel,
  MenuSeparator,
} from '@askrjs/ui';
```

## Disclosure components

```ts
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from '@askrjs/ui';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@askrjs/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@askrjs/ui';
```

## Status components

```ts
import { Spinner } from '@askrjs/ui';
import { Progress, ProgressIndicator } from '@askrjs/ui';
import { ProgressCircle, ProgressCircleIndicator } from '@askrjs/ui';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
} from '@askrjs/ui';
```

## Identity components

```ts
import { Avatar, AvatarFallback, AvatarImage } from '@askrjs/ui';
```

## Navigation components

`NavLink` is the route-aware anchor for navbar-style links. It marks the
current route with `aria-current="page"` and `data-state="active"`.

```ts
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  NavLink,
} from '@askrjs/ui';
import {
  Pagination,
  PaginationPrevious,
  PaginationNext,
  PaginationPage,
  PaginationEllipsis,
} from '@askrjs/ui';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarPortal,
  MenubarContent,
  MenubarItem,
  MenubarGroup,
  MenubarLabel,
  MenubarSeparator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from '@askrjs/ui';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
  NavigationMenuIndicator,
  NavigationMenuSub,
  NavigationMenuSubTrigger,
  NavigationMenuSubContent,
} from '@askrjs/ui';
```

## Pattern components

```ts
import {
  createDataTable,
  column,
  DataTableRoot,
  DataTableContent,
  DataTableTableView,
  DataTableTableHeader,
  DataTableTableBody,
  DataTableHeaderRow,
  DataTableHead,
  DataTableRow,
  DataTableCell,
  DataTableExpandedRow,
  DataTableListView,
  DataTableListItem,
  DataTableListMain,
  DataTableListMeta,
  DataTableListActions,
  DataTableListExpanded,
  DataTableToolbar,
  DataTableSearch,
  DataTablePagination,
  DataTableEmpty,
  DataTableLoading,
  DataTableError,
} from '@askrjs/ui';
```

Visual-only layout and display components are exported by
`@askrjs/themes/default/*`, not `@askrjs/ui`.

## See also

- [askr-ui overview](./askr-ui.md)
- [Composition](./composition.md)
- [Styling](../styling/askr-themes.md)

