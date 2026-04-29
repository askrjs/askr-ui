import type { JSXElement } from '@askrjs/askr/foundations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DismissableLayer,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Field,
  FieldInput,
  FocusRing,
  FocusScope,
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Switch,
  Toggle,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
  type AlertDialogActionAsChildProps,
  type AlertDialogActionProps,
  type AlertDialogCancelAsChildProps,
  type AlertDialogCancelProps,
  type AlertDialogContentAsChildProps,
  type AlertDialogContentProps,
  type AlertDialogProps,
  type AlertDialogTriggerAsChildProps,
  type AlertDialogTriggerProps,
  type ButtonAsChildProps,
  type ButtonNativeProps,
  type ButtonProps,
  type CheckboxAsChildProps,
  type CheckboxInputProps,
  type CheckboxProps,
  type CollapsibleContentAsChildProps,
  type CollapsibleContentProps,
  type CollapsibleProps,
  type CollapsibleTriggerAsChildProps,
  type CollapsibleTriggerProps,
  type DialogCloseAsChildProps,
  type DialogCloseProps,
  type DialogContentAsChildProps,
  type DialogContentProps,
  type DialogProps,
  type DialogTriggerAsChildProps,
  type DialogTriggerProps,
  type DismissableLayerAsChildProps,
  type DismissableLayerProps,
  type DropdownMenuContentAsChildProps,
  type DropdownMenuContentProps,
  type DropdownMenuItemAsChildProps,
  type DropdownMenuItemProps,
  type FieldInputProps,
  type FieldProps,
  type FieldTextareaProps,
  type FocusRingAsChildProps,
  type FocusRingProps,
  type FocusScopeAsChildProps,
  type FocusScopeProps,
  type MenuContentAsChildProps,
  type MenuContentProps,
  type MenuItemAsChildProps,
  type MenuItemProps,
  type PopoverCloseAsChildProps,
  type PopoverCloseProps,
  type PopoverContentAsChildProps,
  type PopoverContentProps,
  type PopoverProps,
  type PopoverTriggerAsChildProps,
  type PopoverTriggerProps,
  type RadioGroupItemAsChildProps,
  type RadioGroupItemProps,
  type RadioGroupProps,
  type SelectContentAsChildProps,
  type SelectContentProps,
  type SelectItemAsChildProps,
  type SelectItemProps,
  type SelectProps,
  type SelectTriggerAsChildProps,
  type SelectTriggerProps,
  type SelectValueAsChildProps,
  type SelectValueProps,
  type SwitchAsChildProps,
  type SwitchButtonProps,
  type SwitchProps,
  type ToggleAsChildProps,
  type ToggleButtonProps,
  type ToggleProps,
  type TooltipContentAsChildProps,
  type TooltipContentProps,
  type TooltipProps,
  type TooltipTriggerAsChildProps,
  type TooltipTriggerProps,
} from '@askrjs/ui';
import { AlertDialog as AlertDialogSubpath } from '@askrjs/ui/composites/alert-dialog';
import { Button as ButtonSubpath } from '@askrjs/ui/primitives/button';
import { Checkbox as CheckboxSubpath } from '@askrjs/ui/primitives/checkbox';
import { Collapsible as CollapsibleSubpath } from '@askrjs/ui/composites/collapsible';
import { Dialog as DialogSubpath } from '@askrjs/ui/composites/dialog';
import { DropdownMenu as DropdownMenuSubpath } from '@askrjs/ui/composites/dropdown-menu';
import { FocusRing as FocusRingSubpath } from '@askrjs/ui/composites/focus-ring';
import { FocusScope as FocusScopeSubpath } from '@askrjs/ui/composites/focus-scope';
import { Menu as MenuSubpath } from '@askrjs/ui/composites/menu';
import { Popover as PopoverSubpath } from '@askrjs/ui/composites/popover';
import { Select as SelectSubpath } from '@askrjs/ui/primitives/select';
import { Switch as SwitchSubpath } from '@askrjs/ui/primitives/switch';
import { Toggle as ToggleSubpath } from '@askrjs/ui/primitives/toggle';
import { Tooltip as TooltipSubpath } from '@askrjs/ui/composites/tooltip';

const slotChild = {} as JSXElement;

const buttonFromSubpath: typeof Button = ButtonSubpath;
const checkboxFromSubpath: typeof Checkbox = CheckboxSubpath;
const collapsibleFromSubpath: typeof Collapsible = CollapsibleSubpath;
const focusRingFromSubpath: typeof FocusRing = FocusRingSubpath;
const focusScopeFromSubpath: typeof FocusScope = FocusScopeSubpath;
const dialogFromSubpath: typeof Dialog = DialogSubpath;
const alertDialogFromSubpath: typeof AlertDialog = AlertDialogSubpath;
const popoverFromSubpath: typeof Popover = PopoverSubpath;
const menuFromSubpath: typeof Menu = MenuSubpath;
const dropdownMenuFromSubpath: typeof DropdownMenu = DropdownMenuSubpath;
const selectFromSubpath: typeof Select = SelectSubpath;
const tooltipFromSubpath: typeof Tooltip = TooltipSubpath;
const fieldFromRoot: typeof Field = Field;
const fieldInputFromRoot: typeof FieldInput = FieldInput;
const radioGroupFromRoot: typeof RadioGroup = RadioGroup;
const radioGroupItemFromRoot: typeof RadioGroupItem = RadioGroupItem;
const switchFromSubpath: typeof Switch = SwitchSubpath;
const toggleFromSubpath: typeof Toggle = ToggleSubpath;

const fieldInputProps: FieldInputProps = {};

const focusRingProps: FocusRingProps = { children: 'ring' };
const focusRingAsChildProps: FocusRingAsChildProps = {
  asChild: true,
  children: slotChild,
};

const focusScopeProps: FocusScopeProps = { trapped: true, loop: true };
const focusScopeAsChildProps: FocusScopeAsChildProps = {
  asChild: true,
  children: slotChild,
};

const dismissableLayerProps: DismissableLayerProps = {
  onDismiss: () => {},
};
const dismissableLayerAsChildProps: DismissableLayerAsChildProps = {
  asChild: true,
  children: slotChild,
  onDismiss: () => {},
};

const buttonProps: ButtonProps = { children: 'Save' };
const buttonNativeProps: ButtonNativeProps = {
  type: 'submit',
  children: 'Submit',
};
const buttonAsChildProps: ButtonAsChildProps = {
  asChild: true,
  children: slotChild,
};

const checkboxControlledProps: CheckboxProps = {
  checked: true,
  indeterminate: false,
  onCheckedChange: (checked: boolean) => checked,
};
const checkboxUncontrolledProps: CheckboxProps = { defaultChecked: true };
const checkboxInputProps: CheckboxInputProps = { name: 'terms', value: 'yes' };
const checkboxAsChildProps: CheckboxAsChildProps = {
  asChild: true,
  children: slotChild,
  checked: true,
};

const collapsibleProps: CollapsibleProps = {
  defaultOpen: true,
};
const collapsibleTriggerProps: CollapsibleTriggerProps = {
  children: 'Toggle details',
};
const collapsibleTriggerAsChildProps: CollapsibleTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
};
const collapsibleContentProps: CollapsibleContentProps = {
  forceMount: true,
  children: 'Body',
};
const collapsibleContentAsChildProps: CollapsibleContentAsChildProps = {
  asChild: true,
  children: slotChild,
};

const toggleProps: ToggleProps = { pressed: true, children: 'Bold' };
const toggleButtonProps: ToggleButtonProps = { type: 'button' };
const toggleAsChildProps: ToggleAsChildProps = {
  asChild: true,
  children: slotChild,
};

const switchControlledProps: SwitchProps = {
  checked: true,
  onCheckedChange: (checked: boolean) => checked,
};
const switchUncontrolledProps: SwitchProps = { defaultChecked: true };
const switchButtonProps: SwitchButtonProps = { type: 'reset' };
const switchAsChildProps: SwitchAsChildProps = {
  asChild: true,
  children: slotChild,
};

const radioGroupControlledProps: RadioGroupProps = {
  value: 'one',
  onValueChange: (value: string) => value,
};
const radioGroupUncontrolledProps: RadioGroupProps = {
  defaultValue: 'two',
  orientation: 'horizontal',
};
const radioGroupItemProps: RadioGroupItemProps = {
  value: 'one',
  children: 'One',
};
const radioGroupItemAsChildProps: RadioGroupItemAsChildProps = {
  asChild: true,
  value: 'one',
  children: slotChild,
};

const dialogProps: DialogProps = {
  defaultOpen: true,
};
const dialogTriggerProps: DialogTriggerProps = { children: 'Open dialog' };
const dialogTriggerAsChildProps: DialogTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
};
const dialogContentProps: DialogContentProps = {};
const dialogContentAsChildProps: DialogContentAsChildProps = {
  asChild: true,
  children: slotChild,
};
const dialogCloseProps: DialogCloseProps = { children: 'Close' };
const dialogCloseAsChildProps: DialogCloseAsChildProps = {
  asChild: true,
  children: slotChild,
};

const alertDialogProps: AlertDialogProps = {
  defaultOpen: false,
};
const alertDialogTriggerProps: AlertDialogTriggerProps = {
  children: 'Open alert',
};
const alertDialogTriggerAsChildProps: AlertDialogTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
};
const alertDialogContentProps: AlertDialogContentProps = {};
const alertDialogContentAsChildProps: AlertDialogContentAsChildProps = {
  asChild: true,
  children: slotChild,
};
const alertDialogActionProps: AlertDialogActionProps = { children: 'Confirm' };
const alertDialogActionAsChildProps: AlertDialogActionAsChildProps = {
  asChild: true,
  children: slotChild,
};
const alertDialogCancelProps: AlertDialogCancelProps = { children: 'Cancel' };
const alertDialogCancelAsChildProps: AlertDialogCancelAsChildProps = {
  asChild: true,
  children: slotChild,
};

const popoverProps: PopoverProps = { defaultOpen: true };
const popoverTriggerProps: PopoverTriggerProps = { children: 'Open popover' };
const popoverTriggerAsChildProps: PopoverTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
};
const popoverContentProps: PopoverContentProps = { side: 'bottom' };
const popoverContentAsChildProps: PopoverContentAsChildProps = {
  asChild: true,
  children: slotChild,
};
const popoverCloseProps: PopoverCloseProps = { children: 'Close popover' };
const popoverCloseAsChildProps: PopoverCloseAsChildProps = {
  asChild: true,
  children: slotChild,
};

const tooltipProps: TooltipProps = { defaultOpen: false };
const tooltipTriggerProps: TooltipTriggerProps = { children: 'Help' };
const tooltipTriggerAsChildProps: TooltipTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
};
const tooltipContentProps: TooltipContentProps = { side: 'top' };
const tooltipContentAsChildProps: TooltipContentAsChildProps = {
  asChild: true,
  children: slotChild,
};

const menuContentProps: MenuContentProps = {};
const menuContentAsChildProps: MenuContentAsChildProps = {
  asChild: true,
  children: slotChild,
};
const menuItemProps: MenuItemProps = { children: 'Menu item' };
const menuItemAsChildProps: MenuItemAsChildProps = {
  asChild: true,
  children: slotChild,
};

const dropdownMenuContentProps: DropdownMenuContentProps = {};
const dropdownMenuContentAsChildProps: DropdownMenuContentAsChildProps = {
  asChild: true,
  children: slotChild,
};
const dropdownMenuItemProps: DropdownMenuItemProps = { children: 'Action' };
const dropdownMenuItemAsChildProps: DropdownMenuItemAsChildProps = {
  asChild: true,
  children: slotChild,
};

const selectProps: SelectProps = {
  value: 'one',
  onValueChange: (next) => next,
};
const selectTriggerProps: SelectTriggerProps = { children: 'Trigger' };
const selectTriggerAsChildProps: SelectTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
};
const selectValueProps: SelectValueProps = { placeholder: 'Choose one' };
const selectValueAsChildProps: SelectValueAsChildProps = {
  asChild: true,
  children: slotChild,
};
const selectContentProps: SelectContentProps = {};
const selectContentAsChildProps: SelectContentAsChildProps = {
  asChild: true,
  children: slotChild,
};
const selectItemProps: SelectItemProps = {
  value: 'one',
  children: 'One',
};
const selectItemAsChildProps: SelectItemAsChildProps = {
  asChild: true,
  value: 'one',
  children: slotChild,
};

const fieldProps: FieldProps = { id: 'email', invalid: true };

const _invalidButtonAsChild: ButtonAsChildProps = {
  asChild: true,
  children: slotChild,
  // @ts-expect-error asChild button props must not accept native button type.
  type: 'button',
};

const _invalidToggleAsChild: ToggleAsChildProps = {
  asChild: true,
  children: slotChild,
  // @ts-expect-error asChild toggle props must not accept native button type.
  type: 'button',
};

const _invalidSwitchAsChild: SwitchAsChildProps = {
  asChild: true,
  children: slotChild,
  // @ts-expect-error asChild switch props must not accept native button type.
  type: 'submit',
};

// @ts-expect-error asChild radio items require a JSX child.
const _invalidRadioItemAsChild: RadioGroupItemAsChildProps = {
  asChild: true,
  value: 'one',
};

const _invalidSelectTriggerAsChild: SelectTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
  // @ts-expect-error asChild select trigger props must not accept native button type.
  type: 'button',
};

const _invalidDialogTriggerAsChild: DialogTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
  // @ts-expect-error asChild dialog trigger props must not accept native button type.
  type: 'button',
};

// @ts-expect-error select items require a string value.
const _invalidSelectItem: SelectItemProps = { children: 'Missing value' };

void [
  buttonFromSubpath,
  checkboxFromSubpath,
  collapsibleFromSubpath,
  focusRingFromSubpath,
  focusScopeFromSubpath,
  dialogFromSubpath,
  alertDialogFromSubpath,
  popoverFromSubpath,
  menuFromSubpath,
  dropdownMenuFromSubpath,
  selectFromSubpath,
  tooltipFromSubpath,
  fieldFromRoot,
  fieldInputFromRoot,
  fieldInputProps,
  radioGroupFromRoot,
  radioGroupItemFromRoot,
  switchFromSubpath,
  toggleFromSubpath,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  DismissableLayer,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  FocusRing,
  FocusScope,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
  focusRingProps,
  focusRingAsChildProps,
  focusScopeProps,
  focusScopeAsChildProps,
  dismissableLayerProps,
  dismissableLayerAsChildProps,
  buttonProps,
  buttonNativeProps,
  buttonAsChildProps,
  checkboxControlledProps,
  checkboxUncontrolledProps,
  checkboxInputProps,
  checkboxAsChildProps,
  collapsibleProps,
  collapsibleTriggerProps,
  collapsibleTriggerAsChildProps,
  collapsibleContentProps,
  collapsibleContentAsChildProps,
  toggleProps,
  toggleButtonProps,
  toggleAsChildProps,
  switchControlledProps,
  switchUncontrolledProps,
  switchButtonProps,
  switchAsChildProps,
  radioGroupControlledProps,
  radioGroupUncontrolledProps,
  radioGroupItemProps,
  radioGroupItemAsChildProps,
  dialogProps,
  dialogTriggerProps,
  dialogTriggerAsChildProps,
  dialogContentProps,
  dialogContentAsChildProps,
  dialogCloseProps,
  dialogCloseAsChildProps,
  alertDialogProps,
  alertDialogTriggerProps,
  alertDialogTriggerAsChildProps,
  alertDialogContentProps,
  alertDialogContentAsChildProps,
  alertDialogActionProps,
  alertDialogActionAsChildProps,
  alertDialogCancelProps,
  alertDialogCancelAsChildProps,
  popoverProps,
  popoverTriggerProps,
  popoverTriggerAsChildProps,
  popoverContentProps,
  popoverContentAsChildProps,
  popoverCloseProps,
  popoverCloseAsChildProps,
  tooltipProps,
  tooltipTriggerProps,
  tooltipTriggerAsChildProps,
  tooltipContentProps,
  tooltipContentAsChildProps,
  menuContentProps,
  menuContentAsChildProps,
  menuItemProps,
  menuItemAsChildProps,
  dropdownMenuContentProps,
  dropdownMenuContentAsChildProps,
  dropdownMenuItemProps,
  dropdownMenuItemAsChildProps,
  selectProps,
  selectTriggerProps,
  selectTriggerAsChildProps,
  selectValueProps,
  selectValueAsChildProps,
  selectContentProps,
  selectContentAsChildProps,
  selectItemProps,
  selectItemAsChildProps,
  fieldProps,
  buttonNativeProps,
];

