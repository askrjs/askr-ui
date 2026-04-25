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
  { bucket: 'primitives', name: 'spinner' },
  { bucket: 'primitives', name: 'switch' },
  { bucket: 'primitives', name: 'textarea' },
  { bucket: 'primitives', name: 'toggle' },
  { bucket: 'primitives', name: 'toggle-group' },
  { bucket: 'primitives', name: 'visually-hidden' },
  { bucket: 'composites', name: 'accordion' },
  { bucket: 'composites', name: 'alert-dialog' },
  { bucket: 'composites', name: 'breadcrumb' },
  { bucket: 'composites', name: 'collapsible' },
  { bucket: 'composites', name: 'dialog' },
  { bucket: 'composites', name: 'dismissable-layer' },
  { bucket: 'composites', name: 'dropdown-menu' },
  { bucket: 'composites', name: 'field' },
  { bucket: 'composites', name: 'focus-ring' },
  { bucket: 'composites', name: 'focus-scope' },
  { bucket: 'composites', name: 'menu' },
  { bucket: 'composites', name: 'menubar' },
  { bucket: 'composites', name: 'navigation-menu' },
  { bucket: 'composites', name: 'pagination' },
  { bucket: 'composites', name: 'popover' },
  { bucket: 'composites', name: 'tabs' },
  { bucket: 'composites', name: 'toast' },
  { bucket: 'composites', name: 'tooltip' },
  { bucket: 'patterns', name: 'data-table' },
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
      'field',
      'radio-group',
      'switch',
      'select',
      'slider',
      'toggle-group',
    ],
  },
  {
    label: 'Focus',
    names: ['focus-ring', 'focus-scope', 'dismissable-layer'],
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
    names: ['progress', 'progress-circle', 'toast', 'spinner'],
  },
  {
    label: 'Identity',
    names: ['avatar'],
  },
  {
    label: 'Navigation',
    names: ['breadcrumb', 'pagination', 'menubar', 'navigation-menu'],
  },
  {
    label: 'Patterns',
    names: ['data-table'],
  },
];

export const removedPublicExports = [
  'badge',
  'box',
  'center',
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
