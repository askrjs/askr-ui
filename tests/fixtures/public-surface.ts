// Generated - do not edit. Run `npm run generate` to update.

import * as AvatarModule from '../../src/components/primitives/avatar/index';
import * as ButtonModule from '../../src/components/primitives/button/index';
import * as CheckboxModule from '../../src/components/primitives/checkbox/index';
import * as InputModule from '../../src/components/primitives/input/index';
import * as FormModule from '../../src/components/primitives/form/index';
import * as LabelModule from '../../src/components/primitives/label/index';
import * as ProgressModule from '../../src/components/primitives/progress/index';
import * as ProgressCircleModule from '../../src/components/primitives/progress-circle/index';
import * as RadioGroupModule from '../../src/components/primitives/radio-group/index';
import * as SelectModule from '../../src/components/primitives/select/index';
import * as SliderModule from '../../src/components/primitives/slider/index';
import * as SwitchModule from '../../src/components/primitives/switch/index';
import * as TableModule from '../../src/components/primitives/table/index';
import * as TextareaModule from '../../src/components/primitives/textarea/index';
import * as ToggleModule from '../../src/components/primitives/toggle/index';
import * as ToggleGroupModule from '../../src/components/primitives/toggle-group/index';
import * as VisuallyHiddenModule from '../../src/components/primitives/visually-hidden/index';
import * as AccordionModule from '../../src/components/composites/accordion/index';
import * as AlertDialogModule from '../../src/components/composites/alert-dialog/index';
import * as CollapsibleModule from '../../src/components/composites/collapsible/index';
import * as DialogModule from '../../src/components/composites/dialog/index';
import * as DismissableLayerModule from '../../src/components/composites/dismissable-layer/index';
import * as DropdownMenuModule from '../../src/components/composites/dropdown-menu/index';
import * as FocusScopeModule from '../../src/components/composites/focus-scope/index';
import * as HoverCardModule from '../../src/components/composites/hover-card/index';
import * as MenuModule from '../../src/components/composites/menu/index';
import * as MenubarModule from '../../src/components/composites/menubar/index';
import * as NavigationMenuModule from '../../src/components/composites/navigation-menu/index';
import * as PopoverModule from '../../src/components/composites/popover/index';
import * as ScrollAreaModule from '../../src/components/composites/scroll-area/index';
import * as TabsModule from '../../src/components/composites/tabs/index';
import * as ToastModule from '../../src/components/composites/toast/index';
import * as TooltipModule from '../../src/components/composites/tooltip/index';

export const componentSurface = [
  { bucket: 'primitives', name: 'avatar', module: AvatarModule },
  { bucket: 'primitives', name: 'button', module: ButtonModule },
  { bucket: 'primitives', name: 'checkbox', module: CheckboxModule },
  { bucket: 'primitives', name: 'input', module: InputModule },
  { bucket: 'primitives', name: 'form', module: FormModule },
  { bucket: 'primitives', name: 'label', module: LabelModule },
  { bucket: 'primitives', name: 'progress', module: ProgressModule },
  { bucket: 'primitives', name: 'progress-circle', module: ProgressCircleModule },
  { bucket: 'primitives', name: 'radio-group', module: RadioGroupModule },
  { bucket: 'primitives', name: 'select', module: SelectModule },
  { bucket: 'primitives', name: 'slider', module: SliderModule },
  { bucket: 'primitives', name: 'switch', module: SwitchModule },
  { bucket: 'primitives', name: 'table', module: TableModule },
  { bucket: 'primitives', name: 'textarea', module: TextareaModule },
  { bucket: 'primitives', name: 'toggle', module: ToggleModule },
  { bucket: 'primitives', name: 'toggle-group', module: ToggleGroupModule },
  { bucket: 'primitives', name: 'visually-hidden', module: VisuallyHiddenModule },
  { bucket: 'composites', name: 'accordion', module: AccordionModule },
  { bucket: 'composites', name: 'alert-dialog', module: AlertDialogModule },
  { bucket: 'composites', name: 'collapsible', module: CollapsibleModule },
  { bucket: 'composites', name: 'dialog', module: DialogModule },
  { bucket: 'composites', name: 'dismissable-layer', module: DismissableLayerModule },
  { bucket: 'composites', name: 'dropdown-menu', module: DropdownMenuModule },
  { bucket: 'composites', name: 'focus-scope', module: FocusScopeModule },
  { bucket: 'composites', name: 'hover-card', module: HoverCardModule },
  { bucket: 'composites', name: 'menu', module: MenuModule },
  { bucket: 'composites', name: 'menubar', module: MenubarModule },
  { bucket: 'composites', name: 'navigation-menu', module: NavigationMenuModule },
  { bucket: 'composites', name: 'popover', module: PopoverModule },
  { bucket: 'composites', name: 'scroll-area', module: ScrollAreaModule },
  { bucket: 'composites', name: 'tabs', module: TabsModule },
  { bucket: 'composites', name: 'toast', module: ToastModule },
  { bucket: 'composites', name: 'tooltip', module: TooltipModule },
] as const;

export const publicValueExports = Array.from(new Set(componentSurface.flatMap((entry) => Object.keys(entry.module).filter((name) => name !== 'default' && !name.startsWith('__'))))).sort();

export const removedPublicExports = ["Badge","Box","Center","Breadcrumb","Container","Flex","Grid","Inline","Section","Separator","Skeleton","Spacer","Stack","SidebarLayout","Spinner","TopbarLayout"] as const;

export const docsCategories = [
  {
    "label": "Foundation",
    "names": [
      "button",
      "toggle",
      "checkbox",
      "visually-hidden",
      "label",
      "input",
      "form",
      "textarea",
      "radio-group",
      "switch",
      "select",
      "slider",
      "toggle-group"
    ]
  },
  {
    "label": "Focus",
    "names": [
      "focus-scope",
      "dismissable-layer"
    ]
  },
  {
    "label": "Overlay",
    "names": [
      "dialog",
      "alert-dialog",
      "popover",
      "hover-card",
      "tooltip",
      "dropdown-menu",
      "menu"
    ]
  },
  {
    "label": "Layout",
    "names": [
      "scroll-area"
    ]
  },
  {
    "label": "Disclosure",
    "names": [
      "accordion",
      "collapsible",
      "tabs"
    ]
  },
  {
    "label": "Status",
    "names": [
      "progress",
      "progress-circle",
      "toast"
    ]
  },
  {
    "label": "Identity",
    "names": [
      "avatar"
    ]
  },
  {
    "label": "Navigation",
    "names": [
      "menubar",
      "navigation-menu"
    ]
  },
  {
    "label": "Tables",
    "names": [
      "table"
    ]
  }
] as const;
