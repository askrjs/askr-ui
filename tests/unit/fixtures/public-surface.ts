// Public surface fixture used by type and API tests.

import * as AvatarModule from '../../../src/components/avatar/index';
import * as ButtonModule from '../../../src/components/button/index';
import * as CheckboxModule from '../../../src/components/checkbox/index';
import * as InputModule from '../../../src/components/input/index';
import * as FormModule from '../../../src/components/form/index';
import * as LabelModule from '../../../src/components/label/index';
import * as ProgressModule from '../../../src/components/progress/index';
import * as ProgressCircleModule from '../../../src/components/progress-circle/index';
import * as RadioGroupModule from '../../../src/components/radio-group/index';
import * as SelectModule from '../../../src/components/select/index';
import * as SliderModule from '../../../src/components/slider/index';
import * as SwitchModule from '../../../src/components/switch/index';
import * as TableModule from '../../../src/components/table/index';
import * as VirtualListModule from '../../../src/components/virtual-list/index';
import * as VirtualTableModule from '../../../src/components/virtual-table/index';
import * as TextareaModule from '../../../src/components/textarea/index';
import * as ToggleModule from '../../../src/components/toggle/index';
import * as ToggleGroupModule from '../../../src/components/toggle-group/index';
import * as VisuallyHiddenModule from '../../../src/components/visually-hidden/index';
import * as AccordionModule from '../../../src/components/accordion/index';
import * as AlertDialogModule from '../../../src/components/alert-dialog/index';
import * as CollapsibleModule from '../../../src/components/collapsible/index';
import * as DialogModule from '../../../src/components/dialog/index';
import * as DismissableLayerModule from '../../../src/components/dismissable-layer/index';
import * as DropdownModule from '../../../src/components/dropdown/index';
import * as FocusScopeModule from '../../../src/components/focus-scope/index';
import * as HoverCardModule from '../../../src/components/hover-card/index';
import * as MenuModule from '../../../src/components/menu/index';
import * as MenubarModule from '../../../src/components/menubar/index';
import * as PopoverModule from '../../../src/components/popover/index';
import * as ScrollAreaModule from '../../../src/components/scroll-area/index';
import * as ToastModule from '../../../src/components/toast/index';
import * as TooltipModule from '../../../src/components/tooltip/index';

export const componentSurface = [
  { bucket: 'primitives', name: 'avatar', module: AvatarModule },
  { bucket: 'primitives', name: 'button', module: ButtonModule },
  { bucket: 'primitives', name: 'checkbox', module: CheckboxModule },
  { bucket: 'primitives', name: 'input', module: InputModule },
  { bucket: 'primitives', name: 'form', module: FormModule },
  { bucket: 'primitives', name: 'label', module: LabelModule },
  { bucket: 'primitives', name: 'progress', module: ProgressModule },
  {
    bucket: 'primitives',
    name: 'progress-circle',
    module: ProgressCircleModule,
  },
  { bucket: 'primitives', name: 'radio-group', module: RadioGroupModule },
  { bucket: 'primitives', name: 'select', module: SelectModule },
  { bucket: 'primitives', name: 'slider', module: SliderModule },
  { bucket: 'primitives', name: 'switch', module: SwitchModule },
  { bucket: 'primitives', name: 'table', module: TableModule },
  { bucket: 'primitives', name: 'virtual-list', module: VirtualListModule },
  { bucket: 'primitives', name: 'virtual-table', module: VirtualTableModule },
  { bucket: 'primitives', name: 'textarea', module: TextareaModule },
  { bucket: 'primitives', name: 'toggle', module: ToggleModule },
  { bucket: 'primitives', name: 'toggle-group', module: ToggleGroupModule },
  {
    bucket: 'primitives',
    name: 'visually-hidden',
    module: VisuallyHiddenModule,
  },
  { bucket: 'composites', name: 'accordion', module: AccordionModule },
  { bucket: 'composites', name: 'alert-dialog', module: AlertDialogModule },
  { bucket: 'composites', name: 'collapsible', module: CollapsibleModule },
  { bucket: 'composites', name: 'dialog', module: DialogModule },
  {
    bucket: 'composites',
    name: 'dismissable-layer',
    module: DismissableLayerModule,
  },
  { bucket: 'composites', name: 'dropdown', module: DropdownModule },
  { bucket: 'composites', name: 'focus-scope', module: FocusScopeModule },
  { bucket: 'composites', name: 'hover-card', module: HoverCardModule },
  { bucket: 'composites', name: 'menu', module: MenuModule },
  { bucket: 'composites', name: 'menubar', module: MenubarModule },
  { bucket: 'composites', name: 'popover', module: PopoverModule },
  { bucket: 'composites', name: 'scroll-area', module: ScrollAreaModule },
  { bucket: 'composites', name: 'toast', module: ToastModule },
  { bucket: 'composites', name: 'tooltip', module: TooltipModule },
] as const;

export const publicValueExports = Array.from(
  new Set(
    componentSurface.flatMap((entry) =>
      Object.keys(entry.module).filter(
        (name) => name !== 'default' && !name.startsWith('__')
      )
    )
  )
).sort();

export const removedPublicExports = [
  'Badge',
  'Box',
  'Center',
  'Breadcrumb',
  'Container',
  'Flex',
  'Grid',
  'Inline',
  'Section',
  'Separator',
  'Skeleton',
  'Spacer',
  'Stack',
  'SidebarLayout',
  'Spinner',
  'TopbarLayout',
] as const;

export const docsCategories = [
  {
    label: 'Foundation',
    names: [
      'button',
      'toggle',
      'checkbox',
      'visually-hidden',
      'label',
      'input',
      'form',
      'textarea',
      'radio-group',
      'switch',
      'select',
      'slider',
      'toggle-group',
    ],
  },
  {
    label: 'Focus',
    names: ['focus-scope', 'dismissable-layer'],
  },
  {
    label: 'Overlay',
    names: [
      'dialog',
      'alert-dialog',
      'popover',
      'hover-card',
      'tooltip',
      'dropdown',
      'menu',
    ],
  },
  {
    label: 'Layout',
    names: ['scroll-area'],
  },
  {
    label: 'Disclosure',
    names: ['accordion', 'collapsible'],
  },
  {
    label: 'Status',
    names: ['progress', 'progress-circle', 'toast'],
  },
  {
    label: 'Identity',
    names: ['avatar'],
  },
  {
    label: 'Navigation',
    names: ['menubar'],
  },
  {
    label: 'Tables',
    names: ['table'],
  },
  {
    label: 'Virtualization',
    names: ['virtual-list', 'virtual-table'],
  },
] as const;
