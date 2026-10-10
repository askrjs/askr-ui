// Installed CommonJS consumer: both conditions use the canonical ESM declaration graph.
import Entry0 = require('@askrjs/ui');
import Entry1 = require('@askrjs/ui/accordion');
import Entry2 = require('@askrjs/ui/alert-dialog');
import Entry3 = require('@askrjs/ui/avatar');
import Entry4 = require('@askrjs/ui/button');
import Entry5 = require('@askrjs/ui/checkbox');
import Entry6 = require('@askrjs/ui/collapsible');
import Entry7 = require('@askrjs/ui/dialog');
import Entry8 = require('@askrjs/ui/dismissable-layer');
import Entry9 = require('@askrjs/ui/dropdown');
import Entry10 = require('@askrjs/ui/focus-scope');
import Entry11 = require('@askrjs/ui/form');
import Entry12 = require('@askrjs/ui/hover-card');
import Entry13 = require('@askrjs/ui/input');
import Entry14 = require('@askrjs/ui/label');
import Entry15 = require('@askrjs/ui/menu');
import Entry16 = require('@askrjs/ui/menubar');
import Entry17 = require('@askrjs/ui/overlay-host');
import Entry18 = require('@askrjs/ui/popover');
import Entry19 = require('@askrjs/ui/progress');
import Entry20 = require('@askrjs/ui/progress-circle');
import Entry21 = require('@askrjs/ui/radio-group');
import Entry22 = require('@askrjs/ui/scroll-area');
import Entry23 = require('@askrjs/ui/select');
import Entry24 = require('@askrjs/ui/slider');
import Entry25 = require('@askrjs/ui/switch');
import Entry26 = require('@askrjs/ui/table');
import Entry27 = require('@askrjs/ui/textarea');
import Entry28 = require('@askrjs/ui/toast');
import Entry29 = require('@askrjs/ui/toggle');
import Entry30 = require('@askrjs/ui/toggle-group');
import Entry31 = require('@askrjs/ui/tooltip');
import Entry32 = require('@askrjs/ui/virtual-list');
import Entry33 = require('@askrjs/ui/virtual-table');
import Entry34 = require('@askrjs/ui/visually-hidden');
interface Row {
  id: string;
  value: number;
}
export const retainedValues = [
  Entry0.Accordion,
  Entry0.AccordionContent,
  Entry0.AccordionHeader,
  Entry0.AccordionItem,
  Entry0.AccordionTrigger,
  Entry0.AlertDialog,
  Entry0.AlertDialogAction,
  Entry0.AlertDialogCancel,
  Entry0.AlertDialogContent,
  Entry0.AlertDialogDescription,
  Entry0.AlertDialogOverlay,
  Entry0.AlertDialogPortal,
  Entry0.AlertDialogTitle,
  Entry0.AlertDialogTrigger,
  Entry0.Avatar,
  Entry0.AvatarFallback,
  Entry0.AvatarImage,
  Entry0.Button,
  Entry0.Checkbox,
  Entry0.Collapsible,
  Entry0.CollapsibleContent,
  Entry0.CollapsibleTrigger,
  Entry0.DebouncedInput,
  Entry0.Dialog,
  Entry0.DialogClose,
  Entry0.DialogContent,
  Entry0.DialogDescription,
  Entry0.DialogOverlay,
  Entry0.DialogPortal,
  Entry0.DialogTitle,
  Entry0.DialogTrigger,
  Entry0.DismissableLayer,
  Entry0.Dropdown,
  Entry0.DropdownContent,
  Entry0.DropdownGroup,
  Entry0.DropdownItem,
  Entry0.DropdownLabel,
  Entry0.DropdownPortal,
  Entry0.DropdownSeparator,
  Entry0.DropdownTrigger,
  Entry0.FocusScope,
  Entry0.Form,
  Entry0.HoverCard,
  Entry0.HoverCardContent,
  Entry0.HoverCardPortal,
  Entry0.HoverCardTrigger,
  Entry0.Input,
  Entry0.Label,
  Entry0.Menu,
  Entry0.Menubar,
  Entry0.MenubarContent,
  Entry0.MenubarGroup,
  Entry0.MenubarItem,
  Entry0.MenubarLabel,
  Entry0.MenubarMenu,
  Entry0.MenubarPortal,
  Entry0.MenubarSeparator,
  Entry0.MenubarSub,
  Entry0.MenubarSubContent,
  Entry0.MenubarSubTrigger,
  Entry0.MenubarTrigger,
  Entry0.MenuContent,
  Entry0.MenuGroup,
  Entry0.MenuItem,
  Entry0.MenuItemDescription,
  Entry0.MenuItemIcon,
  Entry0.MenuItemLabel,
  Entry0.MenuLabel,
  Entry0.MenuSeparator,
  Entry0.OverlayHost,
  Entry0.Popover,
  Entry0.PopoverClose,
  Entry0.PopoverContent,
  Entry0.PopoverPortal,
  Entry0.PopoverTrigger,
  Entry0.Progress,
  Entry0.ProgressCircle,
  Entry0.ProgressCircleIndicator,
  Entry0.ProgressIndicator,
  Entry0.RadioGroup,
  Entry0.RadioGroupItem,
  Entry0.ScrollArea,
  Entry0.ScrollAreaCorner,
  Entry0.ScrollAreaScrollbar,
  Entry0.ScrollAreaThumb,
  Entry0.ScrollAreaViewport,
  Entry0.Select,
  Entry0.SelectContent,
  Entry0.SelectGroup,
  Entry0.SelectItem,
  Entry0.SelectItemText,
  Entry0.SelectLabel,
  Entry0.SelectPortal,
  Entry0.SelectSeparator,
  Entry0.SelectTrigger,
  Entry0.SelectValue,
  Entry0.Slider,
  Entry0.SliderRange,
  Entry0.SliderThumb,
  Entry0.SliderTrack,
  Entry0.Switch,
  Entry0.Table,
  Entry0.TableBody,
  Entry0.TableCaption,
  Entry0.TableCell,
  Entry0.TableFoot,
  Entry0.TableHead,
  Entry0.TableHeaderCell,
  Entry0.TableRow,
  Entry0.Textarea,
  Entry0.Toast,
  Entry0.ToastAction,
  Entry0.ToastClose,
  Entry0.ToastDescription,
  Entry0.ToastHost,
  Entry0.ToastTitle,
  Entry0.ToastViewport,
  Entry0.Toggle,
  Entry0.ToggleGroup,
  Entry0.ToggleGroupItem,
  Entry0.Tooltip,
  Entry0.TooltipContent,
  Entry0.TooltipPortal,
  Entry0.TooltipTrigger,
  Entry0.VirtualList,
  Entry0.VirtualTable,
  Entry0.VisuallyHidden,
  Entry3.Avatar,
  Entry3.AvatarFallback,
  Entry3.AvatarImage,
  Entry4.Button,
  Entry5.Checkbox,
  Entry13.DebouncedInput,
  Entry13.Input,
  Entry11.Form,
  Entry14.Label,
  Entry19.Progress,
  Entry19.ProgressIndicator,
  Entry20.ProgressCircle,
  Entry20.ProgressCircleIndicator,
  Entry21.RadioGroup,
  Entry21.RadioGroupItem,
  Entry23.Select,
  Entry23.SelectContent,
  Entry23.SelectGroup,
  Entry23.SelectItem,
  Entry23.SelectItemText,
  Entry23.SelectLabel,
  Entry23.SelectPortal,
  Entry23.SelectSeparator,
  Entry23.SelectTrigger,
  Entry23.SelectValue,
  Entry24.Slider,
  Entry24.SliderRange,
  Entry24.SliderThumb,
  Entry24.SliderTrack,
  Entry25.Switch,
  Entry26.Table,
  Entry26.TableBody,
  Entry26.TableCaption,
  Entry26.TableCell,
  Entry26.TableFoot,
  Entry26.TableHead,
  Entry26.TableHeaderCell,
  Entry26.TableRow,
  Entry32.VirtualList,
  Entry33.VirtualTable,
  Entry27.Textarea,
  Entry29.Toggle,
  Entry30.ToggleGroup,
  Entry30.ToggleGroupItem,
  Entry34.VisuallyHidden,
  Entry1.Accordion,
  Entry1.AccordionContent,
  Entry1.AccordionHeader,
  Entry1.AccordionItem,
  Entry1.AccordionTrigger,
  Entry2.AlertDialog,
  Entry2.AlertDialogAction,
  Entry2.AlertDialogCancel,
  Entry2.AlertDialogContent,
  Entry2.AlertDialogDescription,
  Entry2.AlertDialogOverlay,
  Entry2.AlertDialogPortal,
  Entry2.AlertDialogTitle,
  Entry2.AlertDialogTrigger,
  Entry6.Collapsible,
  Entry6.CollapsibleContent,
  Entry6.CollapsibleTrigger,
  Entry7.Dialog,
  Entry7.DialogClose,
  Entry7.DialogContent,
  Entry7.DialogDescription,
  Entry7.DialogOverlay,
  Entry7.DialogPortal,
  Entry7.DialogTitle,
  Entry7.DialogTrigger,
  Entry8.DismissableLayer,
  Entry9.Dropdown,
  Entry9.DropdownContent,
  Entry9.DropdownGroup,
  Entry9.DropdownItem,
  Entry9.DropdownLabel,
  Entry9.DropdownPortal,
  Entry9.DropdownSeparator,
  Entry9.DropdownTrigger,
  Entry10.FocusScope,
  Entry12.HoverCard,
  Entry12.HoverCardContent,
  Entry12.HoverCardPortal,
  Entry12.HoverCardTrigger,
  Entry15.Menu,
  Entry15.MenuContent,
  Entry15.MenuGroup,
  Entry15.MenuItem,
  Entry15.MenuItemDescription,
  Entry15.MenuItemIcon,
  Entry15.MenuItemLabel,
  Entry15.MenuLabel,
  Entry15.MenuSeparator,
  Entry16.Menubar,
  Entry16.MenubarContent,
  Entry16.MenubarGroup,
  Entry16.MenubarItem,
  Entry16.MenubarLabel,
  Entry16.MenubarMenu,
  Entry16.MenubarPortal,
  Entry16.MenubarSeparator,
  Entry16.MenubarSub,
  Entry16.MenubarSubContent,
  Entry16.MenubarSubTrigger,
  Entry16.MenubarTrigger,
  Entry17.OverlayHost,
  Entry18.Popover,
  Entry18.PopoverClose,
  Entry18.PopoverContent,
  Entry18.PopoverPortal,
  Entry18.PopoverTrigger,
  Entry22.ScrollArea,
  Entry22.ScrollAreaCorner,
  Entry22.ScrollAreaScrollbar,
  Entry22.ScrollAreaThumb,
  Entry22.ScrollAreaViewport,
  Entry28.Toast,
  Entry28.ToastAction,
  Entry28.ToastClose,
  Entry28.ToastDescription,
  Entry28.ToastHost,
  Entry28.ToastTitle,
  Entry28.ToastViewport,
  Entry31.Tooltip,
  Entry31.TooltipContent,
  Entry31.TooltipPortal,
  Entry31.TooltipTrigger,
];
export interface RetainedTypes {
  Type0: Entry0.AccordionContentAsChildProps;
  Type1: Entry0.AccordionContentOwnProps;
  Type2: Entry0.AccordionContentProps;
  Type3: Entry0.AccordionHeaderAsChildProps;
  Type4: Entry0.AccordionHeaderProps;
  Type5: Entry0.AccordionItemOwnProps;
  Type6: Entry0.AccordionItemProps;
  Type7: Entry0.AccordionMultipleProps;
  Type8: Entry0.AccordionOrientation;
  Type9: Entry0.AccordionProps;
  Type10: Entry0.AccordionSingleProps;
  Type11: Entry0.AccordionTriggerAsChildProps;
  Type12: Entry0.AccordionTriggerProps;
  Type13: Entry0.AlertDialogActionAsChildProps;
  Type14: Entry0.AlertDialogActionProps;
  Type15: Entry0.AlertDialogCancelAsChildProps;
  Type16: Entry0.AlertDialogCancelProps;
  Type17: Entry0.AlertDialogContentAsChildProps;
  Type18: Entry0.AlertDialogContentOwnProps;
  Type19: Entry0.AlertDialogContentProps;
  Type20: Entry0.AlertDialogDescriptionAsChildProps;
  Type21: Entry0.AlertDialogDescriptionProps;
  Type22: Entry0.AlertDialogOverlayAsChildProps;
  Type23: Entry0.AlertDialogOverlayOwnProps;
  Type24: Entry0.AlertDialogOverlayProps;
  Type25: Entry0.AlertDialogOwnProps;
  Type26: Entry0.AlertDialogPortalProps;
  Type27: Entry0.AlertDialogProps;
  Type28: Entry0.AlertDialogTitleAsChildProps;
  Type29: Entry0.AlertDialogTitleProps;
  Type30: Entry0.AlertDialogTriggerAsChildProps;
  Type31: Entry0.AlertDialogTriggerProps;
  Type32: Entry0.AvatarAsChildProps;
  Type33: Entry0.AvatarFallbackAsChildProps;
  Type34: Entry0.AvatarFallbackOwnProps;
  Type35: Entry0.AvatarFallbackProps;
  Type36: Entry0.AvatarImageOwnProps;
  Type37: Entry0.AvatarImageProps;
  Type38: Entry0.AvatarLoadingStatus;
  Type39: Entry0.AvatarOwnProps;
  Type40: Entry0.AvatarProps;
  Type41: Entry0.ButtonAsChildElement;
  Type42: Entry0.ButtonAsChildProps;
  Type43: Entry0.ButtonNativeProps;
  Type44: Entry0.ButtonOwnProps;
  Type45: Entry0.ButtonProps;
  Type46: Entry0.ButtonSize;
  Type47: Entry0.ButtonVariant;
  Type48: Entry0.ButtonWidth;
  Type49: Entry0.CheckboxAsChildProps;
  Type50: Entry0.CheckboxInputProps;
  Type51: Entry0.CheckboxOwnProps;
  Type52: Entry0.CheckboxProps;
  Type53: Entry0.CollapsibleContentAsChildProps;
  Type54: Entry0.CollapsibleContentProps;
  Type55: Entry0.CollapsibleProps;
  Type56: Entry0.CollapsibleTriggerAsChildProps;
  Type57: Entry0.CollapsibleTriggerProps;
  Type58: Entry0.DebouncedInputProps;
  Type59: Entry0.DialogCloseAsChildProps;
  Type60: Entry0.DialogCloseProps;
  Type61: Entry0.DialogContentAsChildProps;
  Type62: Entry0.DialogContentOwnProps;
  Type63: Entry0.DialogContentProps;
  Type64: Entry0.DialogDescriptionAsChildProps;
  Type65: Entry0.DialogDescriptionProps;
  Type66: Entry0.DialogOverlayAsChildProps;
  Type67: Entry0.DialogOverlayOwnProps;
  Type68: Entry0.DialogOverlayProps;
  Type69: Entry0.DialogOwnProps;
  Type70: Entry0.DialogPortalProps;
  Type71: Entry0.DialogProps;
  Type72: Entry0.DialogTitleAsChildProps;
  Type73: Entry0.DialogTitleProps;
  Type74: Entry0.DialogTriggerAsChildProps;
  Type75: Entry0.DialogTriggerProps;
  Type76: Entry0.DismissableLayerAsChildProps;
  Type77: Entry0.DismissableLayerOwnProps;
  Type78: Entry0.DismissableLayerProps;
  Type79: Entry0.DropdownContentAsChildProps;
  Type80: Entry0.DropdownContentOwnProps;
  Type81: Entry0.DropdownContentProps;
  Type82: Entry0.DropdownGroupAsChildProps;
  Type83: Entry0.DropdownGroupProps;
  Type84: Entry0.DropdownItemAsChildProps;
  Type85: Entry0.DropdownItemOwnProps;
  Type86: Entry0.DropdownItemProps;
  Type87: Entry0.DropdownItemVariant;
  Type88: Entry0.DropdownLabelAsChildProps;
  Type89: Entry0.DropdownLabelProps;
  Type90: Entry0.DropdownOwnProps;
  Type91: Entry0.DropdownPortalProps;
  Type92: Entry0.DropdownProps;
  Type93: Entry0.DropdownSeparatorAsChildProps;
  Type94: Entry0.DropdownSeparatorProps;
  Type95: Entry0.DropdownTriggerAsChildProps;
  Type96: Entry0.DropdownTriggerOwnProps;
  Type97: Entry0.DropdownTriggerProps;
  Type98: Entry0.DropdownTriggerSize;
  Type99: Entry0.DropdownTriggerVariant;
  Type100: Entry0.FocusScopeAsChildProps;
  Type101: Entry0.FocusScopeOwnProps;
  Type102: Entry0.FocusScopeProps;
  Type103: Entry0.FormAsChildProps;
  Type104: Entry0.FormProps;
  Type105: Entry0.HoverCardAsChildProps;
  Type106: Entry0.HoverCardContentAsChildProps;
  Type107: Entry0.HoverCardContentProps;
  Type108: Entry0.HoverCardOwnProps;
  Type109: Entry0.HoverCardPortalProps;
  Type110: Entry0.HoverCardProps;
  Type111: Entry0.HoverCardTriggerAsChildProps;
  Type112: Entry0.HoverCardTriggerProps;
  Type113: Entry0.InputAsChildProps;
  Type114: Entry0.InputEvent;
  Type115: Entry0.InputInputProps;
  Type116: Entry0.InputOwnProps;
  Type117: Entry0.InputProps;
  Type118: Entry0.LabelAsChildProps;
  Type119: Entry0.LabelLabelProps;
  Type120: Entry0.LabelOwnProps;
  Type121: Entry0.LabelProps;
  Type122: Entry0.MenubarContentAsChildProps;
  Type123: Entry0.MenubarContentOwnProps;
  Type124: Entry0.MenubarContentProps;
  Type125: Entry0.MenubarGroupAsChildProps;
  Type126: Entry0.MenubarGroupProps;
  Type127: Entry0.MenubarItemAsChildProps;
  Type128: Entry0.MenubarItemProps;
  Type129: Entry0.MenubarLabelAsChildProps;
  Type130: Entry0.MenubarLabelProps;
  Type131: Entry0.MenubarMenuProps;
  Type132: Entry0.MenubarOwnProps;
  Type133: Entry0.MenubarPortalProps;
  Type134: Entry0.MenubarProps;
  Type135: Entry0.MenubarSeparatorAsChildProps;
  Type136: Entry0.MenubarSeparatorProps;
  Type137: Entry0.MenubarSubContentAsChildProps;
  Type138: Entry0.MenubarSubContentProps;
  Type139: Entry0.MenubarSubProps;
  Type140: Entry0.MenubarSubTriggerAsChildProps;
  Type141: Entry0.MenubarSubTriggerProps;
  Type142: Entry0.MenubarTriggerAsChildProps;
  Type143: Entry0.MenubarTriggerProps;
  Type144: Entry0.MenuContentAsChildProps;
  Type145: Entry0.MenuContentProps;
  Type146: Entry0.MenuGroupAsChildProps;
  Type147: Entry0.MenuGroupProps;
  Type148: Entry0.MenuItemAsChildProps;
  Type149: Entry0.MenuItemOwnProps;
  Type150: Entry0.MenuItemPartAsChildProps;
  Type151: Entry0.MenuItemPartProps;
  Type152: Entry0.MenuItemProps;
  Type153: Entry0.MenuLabelAsChildProps;
  Type154: Entry0.MenuLabelProps;
  Type155: Entry0.MenuOwnProps;
  Type156: Entry0.MenuProps;
  Type157: Entry0.MenuSeparatorAsChildProps;
  Type158: Entry0.MenuSeparatorProps;
  Type159: Entry0.OverlayHostProps;
  Type160: Entry0.PopoverCloseAsChildProps;
  Type161: Entry0.PopoverCloseProps;
  Type162: Entry0.PopoverContentAsChildProps;
  Type163: Entry0.PopoverContentOwnProps;
  Type164: Entry0.PopoverContentProps;
  Type165: Entry0.PopoverContentWidth;
  Type166: Entry0.PopoverOwnProps;
  Type167: Entry0.PopoverPortalProps;
  Type168: Entry0.PopoverProps;
  Type169: Entry0.PopoverTriggerAsChildProps;
  Type170: Entry0.PopoverTriggerProps;
  Type171: Entry0.PressEvent;
  Type172: Entry0.ProgressCircleIndicatorAsChildProps;
  Type173: Entry0.ProgressCircleIndicatorProps;
  Type174: Entry0.ProgressCircleOwnProps;
  Type175: Entry0.ProgressCircleProps;
  Type176: Entry0.ProgressIndicatorAsChildProps;
  Type177: Entry0.ProgressIndicatorProps;
  Type178: Entry0.ProgressOwnProps;
  Type179: Entry0.ProgressProps;
  Type180: Entry0.RadioGroupItemAsChildProps;
  Type181: Entry0.RadioGroupItemOwnProps;
  Type182: Entry0.RadioGroupItemProps;
  Type183: Entry0.RadioGroupOwnProps;
  Type184: Entry0.RadioGroupProps;
  Type185: Entry0.ScrollAreaAsChildProps;
  Type186: Entry0.ScrollAreaCornerProps;
  Type187: Entry0.ScrollAreaOwnProps;
  Type188: Entry0.ScrollAreaProps;
  Type189: Entry0.ScrollAreaScrollbarProps;
  Type190: Entry0.ScrollAreaThumbProps;
  Type191: Entry0.ScrollAreaViewportAsChildProps;
  Type192: Entry0.ScrollAreaViewportProps;
  Type193: Entry0.SelectContentAsChildProps;
  Type194: Entry0.SelectContentOwnProps;
  Type195: Entry0.SelectContentProps;
  Type196: Entry0.SelectGroupAsChildProps;
  Type197: Entry0.SelectGroupProps;
  Type198: Entry0.SelectItemAsChildProps;
  Type199: Entry0.SelectItemOwnProps;
  Type200: Entry0.SelectItemProps;
  Type201: Entry0.SelectItemTextAsChildProps;
  Type202: Entry0.SelectItemTextProps;
  Type203: Entry0.SelectLabelAsChildProps;
  Type204: Entry0.SelectLabelProps;
  Type205: Entry0.SelectOwnProps;
  Type206: Entry0.SelectPortalProps;
  Type207: Entry0.SelectProps;
  Type208: Entry0.SelectSeparatorAsChildProps;
  Type209: Entry0.SelectSeparatorProps;
  Type210: Entry0.SelectTriggerAsChildProps;
  Type211: Entry0.SelectTriggerOwnProps;
  Type212: Entry0.SelectTriggerProps;
  Type213: Entry0.SelectTriggerSize;
  Type214: Entry0.SelectValueAsChildProps;
  Type215: Entry0.SelectValueOwnProps;
  Type216: Entry0.SelectValueProps;
  Type217: Entry0.SliderOrientation;
  Type218: Entry0.SliderOwnProps;
  Type219: Entry0.SliderProps;
  Type220: Entry0.SliderRangeAsChildProps;
  Type221: Entry0.SliderRangeProps;
  Type222: Entry0.SliderThumbAsChildProps;
  Type223: Entry0.SliderThumbProps;
  Type224: Entry0.SliderTrackAsChildProps;
  Type225: Entry0.SliderTrackProps;
  Type226: Entry0.SwitchAsChildProps;
  Type227: Entry0.SwitchButtonProps;
  Type228: Entry0.SwitchOwnProps;
  Type229: Entry0.SwitchProps;
  Type230: Entry0.TableAsChildProps;
  Type231: Entry0.TableBodyAsChildProps;
  Type232: Entry0.TableBodyProps;
  Type233: Entry0.TableCaptionAsChildProps;
  Type234: Entry0.TableCaptionProps;
  Type235: Entry0.TableCellAsChildProps;
  Type236: Entry0.TableCellProps;
  Type237: Entry0.TableFootAsChildProps;
  Type238: Entry0.TableFootProps;
  Type239: Entry0.TableHeadAsChildProps;
  Type240: Entry0.TableHeaderCellAsChildProps;
  Type241: Entry0.TableHeaderCellProps;
  Type242: Entry0.TableHeadProps;
  Type243: Entry0.TableProps;
  Type244: Entry0.TableRowAsChildProps;
  Type245: Entry0.TableRowProps;
  Type246: Entry0.TextareaAsChildProps;
  Type247: Entry0.TextareaElementProps;
  Type248: Entry0.TextareaOwnProps;
  Type249: Entry0.TextareaProps;
  Type250: Entry0.ToastActionAsChildProps;
  Type251: Entry0.ToastActionProps;
  Type252: Entry0.ToastCloseAsChildProps;
  Type253: Entry0.ToastCloseProps;
  Type254: Entry0.ToastDescriptionAsChildProps;
  Type255: Entry0.ToastDescriptionProps;
  Type256: Entry0.ToastHostOwnProps;
  Type257: Entry0.ToastHostProps;
  Type258: Entry0.ToastOwnProps;
  Type259: Entry0.ToastProps;
  Type260: Entry0.ToastTitleAsChildProps;
  Type261: Entry0.ToastTitleProps;
  Type262: Entry0.ToastViewportAsChildProps;
  Type263: Entry0.ToastViewportProps;
  Type264: Entry0.ToggleAsChildProps;
  Type265: Entry0.ToggleButtonProps;
  Type266: Entry0.ToggleGroupItemAsChildProps;
  Type267: Entry0.ToggleGroupItemOwnProps;
  Type268: Entry0.ToggleGroupItemProps;
  Type269: Entry0.ToggleGroupMultipleProps;
  Type270: Entry0.ToggleGroupOrientation;
  Type271: Entry0.ToggleGroupProps;
  Type272: Entry0.ToggleGroupSingleProps;
  Type273: Entry0.ToggleOwnProps;
  Type274: Entry0.ToggleProps;
  Type275: Entry0.TooltipContentAsChildProps;
  Type276: Entry0.TooltipContentOwnProps;
  Type277: Entry0.TooltipContentProps;
  Type278: Entry0.TooltipOwnProps;
  Type279: Entry0.TooltipPortalProps;
  Type280: Entry0.TooltipProps;
  Type281: Entry0.TooltipTriggerAsChildProps;
  Type282: Entry0.TooltipTriggerProps;
  Type283: Entry0.VirtualListApi<Row>;
  Type284: Entry0.VirtualListAsChildProps<Row>;
  Type285: Entry0.VirtualListProps<Row>;
  Type286: Entry0.VirtualListRowComponent<Row>;
  Type287: Entry0.VirtualListRowComponentProps<Row>;
  Type288: Entry0.VirtualListRowElement;
  Type289: Entry0.VirtualListState;
  Type290: Entry0.VirtualListViewport;
  Type291: Entry0.VirtualTableApi<Row>;
  Type292: Entry0.VirtualTableAsChildProps<Row>;
  Type293: Entry0.VirtualTableCellComponent<Row>;
  Type294: Entry0.VirtualTableCellComponentProps<Row>;
  Type295: Entry0.VirtualTableCellElement;
  Type296: Entry0.VirtualTableColumn<Row>;
  Type297: Entry0.VirtualTableProps<Row>;
  Type298: Entry0.VirtualTableState;
  Type299: Entry0.VirtualTableViewport;
  Type300: Entry0.VirtualTableWidth;
  Type301: Entry0.VisuallyHiddenAsChildProps;
  Type302: Entry0.VisuallyHiddenOwnProps;
  Type303: Entry0.VisuallyHiddenProps;
  Type304: Entry0.VisuallyHiddenSpanProps;
  Type305: Entry3.AvatarAsChildProps;
  Type306: Entry3.AvatarFallbackAsChildProps;
  Type307: Entry3.AvatarFallbackOwnProps;
  Type308: Entry3.AvatarFallbackProps;
  Type309: Entry3.AvatarImageOwnProps;
  Type310: Entry3.AvatarImageProps;
  Type311: Entry3.AvatarLoadingStatus;
  Type312: Entry3.AvatarOwnProps;
  Type313: Entry3.AvatarProps;
  Type314: Entry4.ButtonAsChildElement;
  Type315: Entry4.ButtonAsChildProps;
  Type316: Entry4.ButtonNativeProps;
  Type317: Entry4.ButtonOwnProps;
  Type318: Entry4.ButtonProps;
  Type319: Entry4.ButtonSize;
  Type320: Entry4.ButtonVariant;
  Type321: Entry4.ButtonWidth;
  Type322: Entry5.CheckboxAsChildProps;
  Type323: Entry5.CheckboxInputProps;
  Type324: Entry5.CheckboxOwnProps;
  Type325: Entry5.CheckboxProps;
  Type326: Entry13.DebouncedInputProps;
  Type327: Entry13.InputAsChildProps;
  Type328: Entry13.InputEvent;
  Type329: Entry13.InputInputProps;
  Type330: Entry13.InputOwnProps;
  Type331: Entry13.InputProps;
  Type332: Entry11.FormAsChildProps;
  Type333: Entry11.FormProps;
  Type334: Entry14.LabelAsChildProps;
  Type335: Entry14.LabelLabelProps;
  Type336: Entry14.LabelOwnProps;
  Type337: Entry14.LabelProps;
  Type338: Entry19.ProgressIndicatorAsChildProps;
  Type339: Entry19.ProgressIndicatorProps;
  Type340: Entry19.ProgressOwnProps;
  Type341: Entry19.ProgressProps;
  Type342: Entry20.ProgressCircleIndicatorAsChildProps;
  Type343: Entry20.ProgressCircleIndicatorProps;
  Type344: Entry20.ProgressCircleOwnProps;
  Type345: Entry20.ProgressCircleProps;
  Type346: Entry21.RadioGroupItemAsChildProps;
  Type347: Entry21.RadioGroupItemOwnProps;
  Type348: Entry21.RadioGroupItemProps;
  Type349: Entry21.RadioGroupOwnProps;
  Type350: Entry21.RadioGroupProps;
  Type351: Entry23.SelectContentAsChildProps;
  Type352: Entry23.SelectContentOwnProps;
  Type353: Entry23.SelectContentProps;
  Type354: Entry23.SelectGroupAsChildProps;
  Type355: Entry23.SelectGroupProps;
  Type356: Entry23.SelectItemAsChildProps;
  Type357: Entry23.SelectItemOwnProps;
  Type358: Entry23.SelectItemProps;
  Type359: Entry23.SelectItemTextAsChildProps;
  Type360: Entry23.SelectItemTextProps;
  Type361: Entry23.SelectLabelAsChildProps;
  Type362: Entry23.SelectLabelProps;
  Type363: Entry23.SelectOwnProps;
  Type364: Entry23.SelectPortalProps;
  Type365: Entry23.SelectProps;
  Type366: Entry23.SelectSeparatorAsChildProps;
  Type367: Entry23.SelectSeparatorProps;
  Type368: Entry23.SelectTriggerAsChildProps;
  Type369: Entry23.SelectTriggerOwnProps;
  Type370: Entry23.SelectTriggerProps;
  Type371: Entry23.SelectTriggerSize;
  Type372: Entry23.SelectValueAsChildProps;
  Type373: Entry23.SelectValueOwnProps;
  Type374: Entry23.SelectValueProps;
  Type375: Entry24.SliderOrientation;
  Type376: Entry24.SliderOwnProps;
  Type377: Entry24.SliderProps;
  Type378: Entry24.SliderRangeAsChildProps;
  Type379: Entry24.SliderRangeProps;
  Type380: Entry24.SliderThumbAsChildProps;
  Type381: Entry24.SliderThumbProps;
  Type382: Entry24.SliderTrackAsChildProps;
  Type383: Entry24.SliderTrackProps;
  Type384: Entry25.SwitchAsChildProps;
  Type385: Entry25.SwitchButtonProps;
  Type386: Entry25.SwitchOwnProps;
  Type387: Entry25.SwitchProps;
  Type388: Entry26.TableAsChildProps;
  Type389: Entry26.TableBodyAsChildProps;
  Type390: Entry26.TableBodyProps;
  Type391: Entry26.TableCaptionAsChildProps;
  Type392: Entry26.TableCaptionProps;
  Type393: Entry26.TableCellAsChildProps;
  Type394: Entry26.TableCellProps;
  Type395: Entry26.TableFootAsChildProps;
  Type396: Entry26.TableFootProps;
  Type397: Entry26.TableHeadAsChildProps;
  Type398: Entry26.TableHeaderCellAsChildProps;
  Type399: Entry26.TableHeaderCellProps;
  Type400: Entry26.TableHeadProps;
  Type401: Entry26.TableProps;
  Type402: Entry26.TableRowAsChildProps;
  Type403: Entry26.TableRowProps;
  Type404: Entry32.VirtualListApi<Row>;
  Type405: Entry32.VirtualListAsChildProps<Row>;
  Type406: Entry32.VirtualListProps<Row>;
  Type407: Entry32.VirtualListRowComponent<Row>;
  Type408: Entry32.VirtualListRowComponentProps<Row>;
  Type409: Entry32.VirtualListRowElement;
  Type410: Entry32.VirtualListState;
  Type411: Entry32.VirtualListViewport;
  Type412: Entry33.VirtualTableApi<Row>;
  Type413: Entry33.VirtualTableAsChildProps<Row>;
  Type414: Entry33.VirtualTableCellComponent<Row>;
  Type415: Entry33.VirtualTableCellComponentProps<Row>;
  Type416: Entry33.VirtualTableCellElement;
  Type417: Entry33.VirtualTableColumn<Row>;
  Type418: Entry33.VirtualTableProps<Row>;
  Type419: Entry33.VirtualTableState;
  Type420: Entry33.VirtualTableViewport;
  Type421: Entry33.VirtualTableWidth;
  Type422: Entry27.TextareaAsChildProps;
  Type423: Entry27.TextareaElementProps;
  Type424: Entry27.TextareaOwnProps;
  Type425: Entry27.TextareaProps;
  Type426: Entry29.PressEvent;
  Type427: Entry29.ToggleAsChildProps;
  Type428: Entry29.ToggleButtonProps;
  Type429: Entry29.ToggleOwnProps;
  Type430: Entry29.ToggleProps;
  Type431: Entry30.ToggleGroupItemAsChildProps;
  Type432: Entry30.ToggleGroupItemOwnProps;
  Type433: Entry30.ToggleGroupItemProps;
  Type434: Entry30.ToggleGroupMultipleProps;
  Type435: Entry30.ToggleGroupOrientation;
  Type436: Entry30.ToggleGroupProps;
  Type437: Entry30.ToggleGroupSingleProps;
  Type438: Entry34.VisuallyHiddenAsChildProps;
  Type439: Entry34.VisuallyHiddenOwnProps;
  Type440: Entry34.VisuallyHiddenProps;
  Type441: Entry34.VisuallyHiddenSpanProps;
  Type442: Entry1.AccordionContentAsChildProps;
  Type443: Entry1.AccordionContentOwnProps;
  Type444: Entry1.AccordionContentProps;
  Type445: Entry1.AccordionHeaderAsChildProps;
  Type446: Entry1.AccordionHeaderProps;
  Type447: Entry1.AccordionItemOwnProps;
  Type448: Entry1.AccordionItemProps;
  Type449: Entry1.AccordionMultipleProps;
  Type450: Entry1.AccordionOrientation;
  Type451: Entry1.AccordionProps;
  Type452: Entry1.AccordionSingleProps;
  Type453: Entry1.AccordionTriggerAsChildProps;
  Type454: Entry1.AccordionTriggerProps;
  Type455: Entry2.AlertDialogActionAsChildProps;
  Type456: Entry2.AlertDialogActionProps;
  Type457: Entry2.AlertDialogCancelAsChildProps;
  Type458: Entry2.AlertDialogCancelProps;
  Type459: Entry2.AlertDialogContentAsChildProps;
  Type460: Entry2.AlertDialogContentOwnProps;
  Type461: Entry2.AlertDialogContentProps;
  Type462: Entry2.AlertDialogDescriptionAsChildProps;
  Type463: Entry2.AlertDialogDescriptionProps;
  Type464: Entry2.AlertDialogOverlayAsChildProps;
  Type465: Entry2.AlertDialogOverlayOwnProps;
  Type466: Entry2.AlertDialogOverlayProps;
  Type467: Entry2.AlertDialogOwnProps;
  Type468: Entry2.AlertDialogPortalProps;
  Type469: Entry2.AlertDialogProps;
  Type470: Entry2.AlertDialogTitleAsChildProps;
  Type471: Entry2.AlertDialogTitleProps;
  Type472: Entry2.AlertDialogTriggerAsChildProps;
  Type473: Entry2.AlertDialogTriggerProps;
  Type474: Entry6.CollapsibleContentAsChildProps;
  Type475: Entry6.CollapsibleContentProps;
  Type476: Entry6.CollapsibleProps;
  Type477: Entry6.CollapsibleTriggerAsChildProps;
  Type478: Entry6.CollapsibleTriggerProps;
  Type479: Entry7.DialogCloseAsChildProps;
  Type480: Entry7.DialogCloseProps;
  Type481: Entry7.DialogContentAsChildProps;
  Type482: Entry7.DialogContentOwnProps;
  Type483: Entry7.DialogContentProps;
  Type484: Entry7.DialogDescriptionAsChildProps;
  Type485: Entry7.DialogDescriptionProps;
  Type486: Entry7.DialogOverlayAsChildProps;
  Type487: Entry7.DialogOverlayOwnProps;
  Type488: Entry7.DialogOverlayProps;
  Type489: Entry7.DialogOwnProps;
  Type490: Entry7.DialogPortalProps;
  Type491: Entry7.DialogProps;
  Type492: Entry7.DialogTitleAsChildProps;
  Type493: Entry7.DialogTitleProps;
  Type494: Entry7.DialogTriggerAsChildProps;
  Type495: Entry7.DialogTriggerProps;
  Type496: Entry8.DismissableLayerAsChildProps;
  Type497: Entry8.DismissableLayerOwnProps;
  Type498: Entry8.DismissableLayerProps;
  Type499: Entry9.DropdownContentAsChildProps;
  Type500: Entry9.DropdownContentOwnProps;
  Type501: Entry9.DropdownContentProps;
  Type502: Entry9.DropdownGroupAsChildProps;
  Type503: Entry9.DropdownGroupProps;
  Type504: Entry9.DropdownItemAsChildProps;
  Type505: Entry9.DropdownItemOwnProps;
  Type506: Entry9.DropdownItemProps;
  Type507: Entry9.DropdownItemVariant;
  Type508: Entry9.DropdownLabelAsChildProps;
  Type509: Entry9.DropdownLabelProps;
  Type510: Entry9.DropdownOwnProps;
  Type511: Entry9.DropdownPortalProps;
  Type512: Entry9.DropdownProps;
  Type513: Entry9.DropdownSeparatorAsChildProps;
  Type514: Entry9.DropdownSeparatorProps;
  Type515: Entry9.DropdownTriggerAsChildProps;
  Type516: Entry9.DropdownTriggerOwnProps;
  Type517: Entry9.DropdownTriggerProps;
  Type518: Entry9.DropdownTriggerSize;
  Type519: Entry9.DropdownTriggerVariant;
  Type520: Entry10.FocusScopeAsChildProps;
  Type521: Entry10.FocusScopeOwnProps;
  Type522: Entry10.FocusScopeProps;
  Type523: Entry12.HoverCardAsChildProps;
  Type524: Entry12.HoverCardContentAsChildProps;
  Type525: Entry12.HoverCardContentProps;
  Type526: Entry12.HoverCardOwnProps;
  Type527: Entry12.HoverCardPortalProps;
  Type528: Entry12.HoverCardProps;
  Type529: Entry12.HoverCardTriggerAsChildProps;
  Type530: Entry12.HoverCardTriggerProps;
  Type531: Entry15.MenuContentAsChildProps;
  Type532: Entry15.MenuContentProps;
  Type533: Entry15.MenuGroupAsChildProps;
  Type534: Entry15.MenuGroupProps;
  Type535: Entry15.MenuItemAsChildProps;
  Type536: Entry15.MenuItemOwnProps;
  Type537: Entry15.MenuItemPartAsChildProps;
  Type538: Entry15.MenuItemPartProps;
  Type539: Entry15.MenuItemProps;
  Type540: Entry15.MenuLabelAsChildProps;
  Type541: Entry15.MenuLabelProps;
  Type542: Entry15.MenuOwnProps;
  Type543: Entry15.MenuProps;
  Type544: Entry15.MenuSeparatorAsChildProps;
  Type545: Entry15.MenuSeparatorProps;
  Type546: Entry16.MenubarContentAsChildProps;
  Type547: Entry16.MenubarContentOwnProps;
  Type548: Entry16.MenubarContentProps;
  Type549: Entry16.MenubarGroupAsChildProps;
  Type550: Entry16.MenubarGroupProps;
  Type551: Entry16.MenubarItemAsChildProps;
  Type552: Entry16.MenubarItemProps;
  Type553: Entry16.MenubarLabelAsChildProps;
  Type554: Entry16.MenubarLabelProps;
  Type555: Entry16.MenubarMenuProps;
  Type556: Entry16.MenubarOwnProps;
  Type557: Entry16.MenubarPortalProps;
  Type558: Entry16.MenubarProps;
  Type559: Entry16.MenubarSeparatorAsChildProps;
  Type560: Entry16.MenubarSeparatorProps;
  Type561: Entry16.MenubarSubContentAsChildProps;
  Type562: Entry16.MenubarSubContentProps;
  Type563: Entry16.MenubarSubProps;
  Type564: Entry16.MenubarSubTriggerAsChildProps;
  Type565: Entry16.MenubarSubTriggerProps;
  Type566: Entry16.MenubarTriggerAsChildProps;
  Type567: Entry16.MenubarTriggerProps;
  Type568: Entry17.OverlayHostProps;
  Type569: Entry18.PopoverCloseAsChildProps;
  Type570: Entry18.PopoverCloseProps;
  Type571: Entry18.PopoverContentAsChildProps;
  Type572: Entry18.PopoverContentOwnProps;
  Type573: Entry18.PopoverContentProps;
  Type574: Entry18.PopoverContentWidth;
  Type575: Entry18.PopoverOwnProps;
  Type576: Entry18.PopoverPortalProps;
  Type577: Entry18.PopoverProps;
  Type578: Entry18.PopoverTriggerAsChildProps;
  Type579: Entry18.PopoverTriggerProps;
  Type580: Entry22.ScrollAreaAsChildProps;
  Type581: Entry22.ScrollAreaCornerProps;
  Type582: Entry22.ScrollAreaOwnProps;
  Type583: Entry22.ScrollAreaProps;
  Type584: Entry22.ScrollAreaScrollbarProps;
  Type585: Entry22.ScrollAreaThumbProps;
  Type586: Entry22.ScrollAreaViewportAsChildProps;
  Type587: Entry22.ScrollAreaViewportProps;
  Type588: Entry28.ToastActionAsChildProps;
  Type589: Entry28.ToastActionProps;
  Type590: Entry28.ToastCloseAsChildProps;
  Type591: Entry28.ToastCloseProps;
  Type592: Entry28.ToastDescriptionAsChildProps;
  Type593: Entry28.ToastDescriptionProps;
  Type594: Entry28.ToastHostOwnProps;
  Type595: Entry28.ToastHostProps;
  Type596: Entry28.ToastOwnProps;
  Type597: Entry28.ToastProps;
  Type598: Entry28.ToastTitleAsChildProps;
  Type599: Entry28.ToastTitleProps;
  Type600: Entry28.ToastViewportAsChildProps;
  Type601: Entry28.ToastViewportProps;
  Type602: Entry31.TooltipContentAsChildProps;
  Type603: Entry31.TooltipContentOwnProps;
  Type604: Entry31.TooltipContentProps;
  Type605: Entry31.TooltipOwnProps;
  Type606: Entry31.TooltipPortalProps;
  Type607: Entry31.TooltipProps;
  Type608: Entry31.TooltipTriggerAsChildProps;
  Type609: Entry31.TooltipTriggerProps;
}
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.ACCORDION_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone1 = Entry0.AccordionA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.ALERT_DIALOG_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone3 = Entry0.AlertDialogA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.AVATAR_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone5 = Entry0.AvatarA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.BUTTON_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone7 = Entry0.ButtonA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.CHECKBOX_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone9 = Entry0.CheckboxA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.COLLAPSIBLE_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.DIALOG_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone12 = Entry0.DialogA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.DISMISSABLE_LAYER_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone14 = Entry0.DismissableLayerA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.DROPDOWN_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone16 = Entry0.DropdownA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.FOCUS_SCOPE_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone18 = Entry0.FocusScopeA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.INPUT_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone20 = Entry0.InputA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.LABEL_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone22 = Entry0.LabelA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.MENU_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone24 = Entry0.MenuA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.MENUBAR_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone26 = Entry0.MenubarA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.POPOVER_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone28 = Entry0.PopoverA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.PROGRESS_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.PROGRESS_CIRCLE_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone31 = Entry0.ProgressA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone32 = Entry0.ProgressCircleA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.RADIO_GROUP_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone34 = Entry0.RadioGroupA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.SELECT_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone36 = Entry0.SelectA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.SLIDER_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone38 = Entry0.SliderA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.SWITCH_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone40 = Entry0.SwitchA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.TEXTAREA_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone42 = Entry0.TextareaA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.TOAST_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone44 = Entry0.ToastA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.TOGGLE_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.TOGGLE_GROUP_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone47 = Entry0.ToggleA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone48 = Entry0.ToggleGroupA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.TOOLTIP_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone50 = Entry0.TooltipA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry0.VISUALLY_HIDDEN_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone52 = Entry0.VisuallyHiddenA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry3.AVATAR_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone54 = Entry3.AvatarA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry4.BUTTON_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone56 = Entry4.ButtonA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry5.CHECKBOX_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone58 = Entry5.CheckboxA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry13.INPUT_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone60 = Entry13.InputA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry14.LABEL_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone62 = Entry14.LabelA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry19.PROGRESS_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone64 = Entry19.ProgressA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry20.PROGRESS_CIRCLE_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone66 = Entry20.ProgressCircleA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry21.RADIO_GROUP_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone68 = Entry21.RadioGroupA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry23.SELECT_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone70 = Entry23.SelectA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry24.SLIDER_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone72 = Entry24.SliderA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry25.SWITCH_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone74 = Entry25.SwitchA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry27.TEXTAREA_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone76 = Entry27.TextareaA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry29.TOGGLE_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone78 = Entry29.ToggleA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry30.TOGGLE_GROUP_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone80 = Entry30.ToggleGroupA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry34.VISUALLY_HIDDEN_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone82 = Entry34.VisuallyHiddenA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry1.ACCORDION_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone84 = Entry1.AccordionA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry2.ALERT_DIALOG_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone86 = Entry2.AlertDialogA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry6.COLLAPSIBLE_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry7.DIALOG_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone89 = Entry7.DialogA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry8.DISMISSABLE_LAYER_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone91 = Entry8.DismissableLayerA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry9.DROPDOWN_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone93 = Entry9.DropdownA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry10.FOCUS_SCOPE_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone95 = Entry10.FocusScopeA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry15.MENU_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone97 = Entry15.MenuA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry16.MENUBAR_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone99 = Entry16.MenubarA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry18.POPOVER_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone101 = Entry18.PopoverA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry28.TOAST_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone103 = Entry28.ToastA11yContract;
// @ts-expect-error Retired metadata is absent from both package conditions.
void Entry31.TOOLTIP_A11Y_CONTRACT;
// @ts-expect-error Retired metadata is absent from both package conditions.
export type Gone105 = Entry31.TooltipA11yContract;
