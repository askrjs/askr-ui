# UI: Components

Reference for all `@askrjs/askr-ui` components.

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
  Separator,
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
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@askrjs/askr-ui';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
  PopoverClose,
} from '@askrjs/askr-ui';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
} from '@askrjs/askr-ui';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@askrjs/askr-ui';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuGroup,
  MenuLabel,
  MenuSeparator,
} from '@askrjs/askr-ui';
```

## Disclosure components

```ts
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
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
import { Badge } from '@askrjs/askr-ui';
import { Spinner } from '@askrjs/askr-ui';
import { Skeleton } from '@askrjs/askr-ui';
import { Progress, ProgressIndicator } from '@askrjs/askr-ui';
import { ProgressCircle, ProgressCircleIndicator } from '@askrjs/askr-ui';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
} from '@askrjs/askr-ui';
```

## Identity components

```ts
import { Avatar, AvatarFallback, AvatarImage } from '@askrjs/askr-ui';
```

## Navigation components

```ts
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@askrjs/askr-ui';
import {
  Pagination,
  PaginationPrevious,
  PaginationNext,
  PaginationPage,
  PaginationEllipsis,
} from '@askrjs/askr-ui';
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
} from '@askrjs/askr-ui';
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
} from '@askrjs/askr-ui';
```

## Layout components

```ts
import { Container, Grid, Flex, Spacer } from '@askrjs/askr-ui';
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
  SidebarLayout,
  TopbarLayout,
} from '@askrjs/askr-ui';
```

## See also

- [askr-ui overview](./askr-ui.md)
- [Composition](./composition.md)
- [Styling](../styling/askr-themes.md)
