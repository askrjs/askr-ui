export const componentFamilies = [
  { bucket: 'primitives', name: 'avatar' },
  { bucket: 'primitives', name: 'button' },
  { bucket: 'primitives', name: 'checkbox' },
  { bucket: 'primitives', name: 'input' },
  { bucket: 'primitives', name: 'label' },
  { bucket: 'primitives', name: 'progress' },
  { bucket: 'primitives', name: 'progress-circle' },
  { bucket: 'primitives', name: 'radio-group' },
  { bucket: 'primitives', name: 'select' },
  { bucket: 'primitives', name: 'slider' },
  { bucket: 'primitives', name: 'switch' },
  { bucket: 'primitives', name: 'table' },
  { bucket: 'primitives', name: 'textarea' },
  { bucket: 'primitives', name: 'toggle' },
  { bucket: 'primitives', name: 'toggle-group' },
  { bucket: 'primitives', name: 'visually-hidden' },
  { bucket: 'composites', name: 'accordion' },
  { bucket: 'composites', name: 'alert-dialog' },
  { bucket: 'composites', name: 'collapsible' },
  { bucket: 'composites', name: 'dialog' },
  { bucket: 'composites', name: 'dismissable-layer' },
  { bucket: 'composites', name: 'dropdown-menu' },
  { bucket: 'composites', name: 'focus-scope' },
  { bucket: 'composites', name: 'menu' },
  { bucket: 'composites', name: 'menubar' },
  { bucket: 'composites', name: 'navigation-menu' },
  { bucket: 'composites', name: 'popover' },
  { bucket: 'composites', name: 'tabs' },
  { bucket: 'composites', name: 'toast' },
  { bucket: 'composites', name: 'tooltip' },
];

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
      'tooltip',
      'dropdown-menu',
      'menu',
    ],
  },
  {
    label: 'Disclosure',
    names: ['accordion', 'collapsible', 'tabs'],
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
    names: ['menubar', 'navigation-menu'],
  },
  {
    label: 'Tables',
    names: ['table'],
  },
];

export const removedPublicExports = [
  'badge',
  'box',
  'center',
  'breadcrumb',
  'container',
  'flex',
  'grid',
  'inline',
  'section',
  'separator',
  'skeleton',
  'spacer',
  'stack',
  'sidebar-layout',
  'spinner',
  'topbar-layout',
];

export function toExportName(name) {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

export function toSourceImportPath(bucket, name) {
  return `../../src/components/${bucket}/${name}/index`;
}
