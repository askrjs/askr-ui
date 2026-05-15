import type { JSXElement } from '@askrjs/askr/foundations';
import * as askrUi from '@askrjs/ui';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
  Progress,
  ProgressCircle,
  ProgressCircleIndicator,
  ProgressIndicator,
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
  Table,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToggleGroup,
  ToggleGroupItem,
  type AccordionContentAsChildProps,
  type AccordionContentProps,
  type AccordionMultipleProps,
  type AccordionSingleProps,
  type AccordionTriggerAsChildProps,
  type AccordionTriggerProps,
  type AvatarFallbackAsChildProps,
  type AvatarFallbackProps,
  type AvatarImageProps,
  type AvatarProps,
  type MenubarContentAsChildProps,
  type MenubarContentProps,
  type MenubarItemAsChildProps,
  type MenubarItemProps,
  type MenubarMenuProps,
  type MenubarProps,
  type MenubarTriggerAsChildProps,
  type MenubarTriggerProps,
  type ProgressCircleProps,
  type ProgressProps,
  type SliderProps,
  type TableBodyProps,
  type TableCaptionProps,
  type TableCellProps,
  type TableFootProps,
  type TableHeadProps,
  type TableHeaderCellProps,
  type TableProps,
  type TableRowProps,
  type ToastActionAsChildProps,
  type ToastActionProps,
  type ToastCloseAsChildProps,
  type ToastCloseProps,
  type ToastOwnProps,
  type ToastProps,
  type ToggleGroupItemAsChildProps,
  type ToggleGroupItemProps,
  type ToggleGroupMultipleProps,
  type ToggleGroupSingleProps,
} from '@askrjs/ui';
import { Accordion as AccordionSubpath } from '@askrjs/ui';
import { Avatar as AvatarSubpath } from '@askrjs/ui';
import { Collapsible as CollapsibleSubpath } from '@askrjs/ui';
import { Menubar as MenubarSubpath } from '@askrjs/ui';
import { Progress as ProgressSubpath } from '@askrjs/ui';
import { ProgressCircle as ProgressCircleSubpath } from '@askrjs/ui';
import { Slider as SliderSubpath } from '@askrjs/ui';
import { Table as TableSubpath } from '@askrjs/ui';
import { ToastProvider as ToastSubpath } from '@askrjs/ui';
import { ToggleGroup as ToggleGroupSubpath } from '@askrjs/ui';

const slotChild = {} as JSXElement;

const accordionFromSubpath: typeof Accordion = AccordionSubpath;
const avatarFromSubpath: typeof Avatar = AvatarSubpath;
const collapsibleFromSubpath: typeof Collapsible = CollapsibleSubpath;
const menubarFromSubpath: typeof Menubar = MenubarSubpath;
const progressFromSubpath: typeof Progress = ProgressSubpath;
const progressCircleFromSubpath: typeof ProgressCircle = ProgressCircleSubpath;
const sliderFromSubpath: typeof Slider = SliderSubpath;
const tableFromSubpath: typeof Table = TableSubpath;
const toastFromSubpath: typeof ToastProvider = ToastSubpath;
const toggleGroupFromSubpath: typeof ToggleGroup = ToggleGroupSubpath;
const menubarFromRoot: typeof Menubar = askrUi.Menubar;

const avatarProps: AvatarProps = { children: 'avatar' };
const avatarImageProps: AvatarImageProps = { src: '/avatar.png', alt: 'User' };
const avatarFallbackProps: AvatarFallbackProps = { children: 'JD' };
const avatarFallbackAsChildProps: AvatarFallbackAsChildProps = {
  asChild: true,
  children: slotChild,
};
const progressProps: ProgressProps = { value: 50, max: 100 };
const progressCircleProps: ProgressCircleProps = { value: 75, max: 100 };
const tableProps: TableProps = { children: 'table' };
const tableCaptionProps: TableCaptionProps = { children: 'Caption' };
const tableHeadProps: TableHeadProps = { children: 'head' };
const tableBodyProps: TableBodyProps = { children: 'body' };
const tableFootProps: TableFootProps = { children: 'foot' };
const tableRowProps: TableRowProps = { children: 'row' };
const tableHeaderCellProps: TableHeaderCellProps = { children: 'name' };
const tableCellProps: TableCellProps = { children: 'Alice' };
const menubarProps: MenubarProps = { children: 'menu' };
const menubarMenuProps: MenubarMenuProps = { children: 'menu' };
const menubarTriggerProps: MenubarTriggerProps = { children: 'File' };
const menubarTriggerAsChildProps: MenubarTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
};
const menubarContentProps: MenubarContentProps = { children: 'Panel' };
const menubarContentAsChildProps: MenubarContentAsChildProps = {
  asChild: true,
  children: slotChild,
};
const menubarItemProps: MenubarItemProps = { children: 'Item' };
const menubarItemAsChildProps: MenubarItemAsChildProps = {
  asChild: true,
  children: slotChild,
};
const accordionSingleProps: AccordionSingleProps = { defaultValue: 'a' };
const accordionMultipleProps: AccordionMultipleProps = {
  type: 'multiple',
  defaultValue: ['a'],
};
const accordionTriggerProps: AccordionTriggerProps = { children: 'Open' };
const accordionTriggerAsChildProps: AccordionTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
};
const accordionContentProps: AccordionContentProps = { children: 'Panel' };
const accordionContentAsChildProps: AccordionContentAsChildProps = {
  asChild: true,
  children: slotChild,
};
const toggleGroupSingleProps: ToggleGroupSingleProps = { defaultValue: 'left' };
const toggleGroupMultipleProps: ToggleGroupMultipleProps = {
  type: 'multiple',
  defaultValue: ['left'],
};
const toggleGroupItemProps: ToggleGroupItemProps = {
  value: 'left',
  children: 'Left',
};
const toggleGroupItemAsChildProps: ToggleGroupItemAsChildProps = {
  asChild: true,
  children: slotChild,
  value: 'left',
};
const toastProps: ToastProps = { defaultOpen: true };
const toastOwnProps: ToastOwnProps = { defaultOpen: false };
const toastActionProps: ToastActionProps = { children: 'Undo' };
const toastActionAsChildProps: ToastActionAsChildProps = {
  asChild: true,
  children: slotChild,
};
const toastCloseProps: ToastCloseProps = { children: 'Dismiss' };
const toastCloseAsChildProps: ToastCloseAsChildProps = {
  asChild: true,
  children: slotChild,
};
const sliderProps: SliderProps = { defaultValue: 25, name: 'volume' };

const _invalidAccordionTrigger: AccordionTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
  // @ts-expect-error asChild accordion trigger props must not accept native button type.
  type: 'button',
};

const _invalidToggleGroupItem: ToggleGroupItemAsChildProps = {
  asChild: true,
  children: slotChild,
  value: 'left',
  // @ts-expect-error asChild toggle group item props must not accept native button type.
  type: 'button',
};

const _invalidMenubarTrigger: MenubarTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
  // @ts-expect-error asChild menubar trigger props must not accept native button type.
  type: 'button',
};

void [
  accordionFromSubpath,
  avatarFromSubpath,
  collapsibleFromSubpath,
  menubarFromSubpath,
  progressFromSubpath,
  progressCircleFromSubpath,
  sliderFromSubpath,
  tableFromSubpath,
  toastFromSubpath,
  toggleGroupFromSubpath,
  menubarFromRoot,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarPortal,
  MenubarContent,
  MenubarItem,
  CollapsibleTrigger,
  CollapsibleContent,
  ProgressIndicator,
  ProgressCircleIndicator,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  ToggleGroupItem,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  SliderTrack,
  SliderRange,
  SliderThumb,
  avatarProps,
  avatarImageProps,
  avatarFallbackProps,
  avatarFallbackAsChildProps,
  progressProps,
  progressCircleProps,
  tableProps,
  tableCaptionProps,
  tableHeadProps,
  tableBodyProps,
  tableFootProps,
  tableRowProps,
  tableHeaderCellProps,
  tableCellProps,
  menubarProps,
  menubarMenuProps,
  menubarTriggerProps,
  menubarTriggerAsChildProps,
  menubarContentProps,
  menubarContentAsChildProps,
  menubarItemProps,
  menubarItemAsChildProps,
  accordionSingleProps,
  accordionMultipleProps,
  accordionTriggerProps,
  accordionTriggerAsChildProps,
  accordionContentProps,
  accordionContentAsChildProps,
  toggleGroupSingleProps,
  toggleGroupMultipleProps,
  toggleGroupItemProps,
  toggleGroupItemAsChildProps,
  toastProps,
  toastOwnProps,
  toastActionProps,
  toastActionAsChildProps,
  toastCloseProps,
  toastCloseAsChildProps,
  sliderProps,
];
