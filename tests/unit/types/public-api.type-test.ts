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
  DebouncedInput,
  Dropdown,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownPortal,
  DropdownSeparator,
  DropdownTrigger,
  FocusScope,
  Input,
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
  type DebouncedInputProps,
  type DropdownContentAsChildProps,
  type DropdownContentProps,
  type DropdownItemAsChildProps,
  type DropdownItemProps,
  type FocusScopeAsChildProps,
  type FocusScopeProps,
  type InputAsChildProps,
  type InputInputProps,
  type InputProps,
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
import { AlertDialog as AlertDialogSubpath } from '@askrjs/ui';
import { Button as ButtonSubpath } from '@askrjs/ui';
import { Checkbox as CheckboxSubpath } from '@askrjs/ui';
import { Collapsible as CollapsibleSubpath } from '@askrjs/ui';
import { Dialog as DialogSubpath } from '@askrjs/ui';
import { Dropdown as DropdownSubpath } from '@askrjs/ui';
import { DebouncedInput as DebouncedInputSubpath } from '@askrjs/ui';
import { FocusScope as FocusScopeSubpath } from '@askrjs/ui';
import { Input as InputSubpath } from '@askrjs/ui';
import { Menu as MenuSubpath } from '@askrjs/ui';
import { Popover as PopoverSubpath } from '@askrjs/ui';
import { Select as SelectSubpath } from '@askrjs/ui';
import { Switch as SwitchSubpath } from '@askrjs/ui';
import { Toggle as ToggleSubpath } from '@askrjs/ui';
import { Tooltip as TooltipSubpath } from '@askrjs/ui';

const slotChild = {} as JSXElement;

const buttonFromSubpath: typeof Button = ButtonSubpath;
const checkboxFromSubpath: typeof Checkbox = CheckboxSubpath;
const collapsibleFromSubpath: typeof Collapsible = CollapsibleSubpath;
const debouncedInputFromSubpath: typeof DebouncedInput = DebouncedInputSubpath;
const focusScopeFromSubpath: typeof FocusScope = FocusScopeSubpath;
const inputFromSubpath: typeof Input = InputSubpath;
const dialogFromSubpath: typeof Dialog = DialogSubpath;
const alertDialogFromSubpath: typeof AlertDialog = AlertDialogSubpath;
const popoverFromSubpath: typeof Popover = PopoverSubpath;
const menuFromSubpath: typeof Menu = MenuSubpath;
const dropdownFromSubpath: typeof Dropdown = DropdownSubpath;
const selectFromSubpath: typeof Select = SelectSubpath;
const tooltipFromSubpath: typeof Tooltip = TooltipSubpath;
const radioGroupFromRoot: typeof RadioGroup = RadioGroup;
const radioGroupItemFromRoot: typeof RadioGroupItem = RadioGroupItem;
const switchFromSubpath: typeof Switch = SwitchSubpath;
const toggleFromSubpath: typeof Toggle = ToggleSubpath;

const focusScopeProps: FocusScopeProps = { trapped: true, loop: true };
const focusScopeAsChildProps: FocusScopeAsChildProps = {
  asChild: true,
  children: slotChild,
};

const inputProps: InputProps = { 'aria-label': 'Search' };
const inputInputProps: InputInputProps = { placeholder: 'Search' };
const inputAsChildProps: InputAsChildProps = {
  asChild: true,
  children: slotChild,
};
const debouncedInputProps: DebouncedInputProps = {
  'aria-label': 'Search',
  debounceMs: 200,
  onDebouncedInput: (value: string) => value,
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

const dropdownContentProps: DropdownContentProps = {};
const dropdownContentAsChildProps: DropdownContentAsChildProps = {
  asChild: true,
  children: slotChild,
};
const dropdownItemProps: DropdownItemProps = { children: 'Action' };
const dropdownItemAsChildProps: DropdownItemAsChildProps = {
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
  debouncedInputFromSubpath,
  focusScopeFromSubpath,
  inputFromSubpath,
  dialogFromSubpath,
  alertDialogFromSubpath,
  popoverFromSubpath,
  menuFromSubpath,
  dropdownFromSubpath,
  selectFromSubpath,
  tooltipFromSubpath,
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
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownPortal,
  DropdownSeparator,
  DropdownTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
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
  focusScopeProps,
  focusScopeAsChildProps,
  inputProps,
  inputInputProps,
  inputAsChildProps,
  debouncedInputProps,
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
  dropdownContentProps,
  dropdownContentAsChildProps,
  dropdownItemProps,
  dropdownItemAsChildProps,
  selectProps,
  selectTriggerProps,
  selectTriggerAsChildProps,
  selectValueProps,
  selectValueAsChildProps,
  selectContentProps,
  selectContentAsChildProps,
  selectItemProps,
  selectItemAsChildProps,
  buttonNativeProps,
];
