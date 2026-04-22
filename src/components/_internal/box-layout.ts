import {
  mergeLayoutStyles,
  resolveSpaceValue,
  serializeResponsiveValue,
  setResponsiveStyleVar,
} from './layout';
import type { BoxLayoutOwnProps } from '../primitives/box/box.types';

const SPACE_PROP_KEYS = new Set([
  'm',
  'mx',
  'my',
  'mt',
  'mr',
  'mb',
  'ml',
  'p',
  'px',
  'py',
  'pt',
  'pr',
  'pb',
  'pl',
  'inset',
  'top',
  'right',
  'bottom',
  'left',
]);

const BOX_PROP_KEYS = new Set<keyof BoxLayoutOwnProps>([
  'display',
  'm',
  'mx',
  'my',
  'mt',
  'mr',
  'mb',
  'ml',
  'p',
  'px',
  'py',
  'pt',
  'pr',
  'pb',
  'pl',
  'width',
  'minWidth',
  'maxWidth',
  'height',
  'minHeight',
  'maxHeight',
  'position',
  'inset',
  'top',
  'right',
  'bottom',
  'left',
  'overflow',
  'overflowX',
  'overflowY',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'gridArea',
  'gridColumn',
  'gridColumnStart',
  'gridColumnEnd',
  'gridRow',
  'gridRowStart',
  'gridRowEnd',
]);

function variableNameForProp(prop: keyof BoxLayoutOwnProps): string {
  switch (prop) {
    case 'overflowX':
      return 'overflow-x';
    case 'overflowY':
      return 'overflow-y';
    case 'minWidth':
      return 'min-width';
    case 'maxWidth':
      return 'max-width';
    case 'minHeight':
      return 'min-height';
    case 'maxHeight':
      return 'max-height';
    case 'flexBasis':
      return 'flex-basis';
    case 'flexGrow':
      return 'flex-grow';
    case 'flexShrink':
      return 'flex-shrink';
    case 'gridArea':
      return 'grid-area';
    case 'gridColumn':
      return 'grid-column';
    case 'gridColumnStart':
      return 'grid-column-start';
    case 'gridColumnEnd':
      return 'grid-column-end';
    case 'gridRow':
      return 'grid-row';
    case 'gridRowStart':
      return 'grid-row-start';
    case 'gridRowEnd':
      return 'grid-row-end';
    default:
      return prop;
  }
}

export function splitBoxLayoutProps<T extends Record<string, unknown>>(
  props: T
): {
  boxProps: Partial<BoxLayoutOwnProps>;
  rest: Omit<T, keyof BoxLayoutOwnProps>;
} {
  const boxProps: Partial<BoxLayoutOwnProps> = {};
  const rest: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (BOX_PROP_KEYS.has(key as keyof BoxLayoutOwnProps)) {
      (boxProps as Record<string, unknown>)[key] = value;
    } else {
      rest[key] = value;
    }
  }

  return { boxProps, rest: rest as Omit<T, keyof BoxLayoutOwnProps> };
}

export function applyBoxLayoutStyles(
  styles: Record<string, string | number>,
  boxProps: Partial<BoxLayoutOwnProps>
) {
  for (const key of BOX_PROP_KEYS) {
    const value = boxProps[key];
    if (value === undefined) continue;

    const variable = variableNameForProp(key);
    if (SPACE_PROP_KEYS.has(key)) {
      setResponsiveStyleVar(
        styles,
        variable,
        value as string | number,
        resolveSpaceValue
      );
      continue;
    }

    setResponsiveStyleVar(
      styles,
      variable,
      value as string | number,
      (input) => input as string | number
    );
  }
}

export function extractBoxDataAttributes(
  boxProps: Partial<BoxLayoutOwnProps>
): Record<string, string | undefined> {
  const attributes: Record<string, string | undefined> = {};

  for (const key of BOX_PROP_KEYS) {
    const value = boxProps[key];
    if (value === undefined) continue;
    attributes[`data-${variableNameForProp(key)}`] = serializeResponsiveValue(
      value as string | number
    );
  }

  return attributes;
}

export function withBoxLayoutStyle(
  styles: Record<string, string | number>,
  userStyle: unknown
): string {
  return mergeLayoutStyles(styles, userStyle);
}
