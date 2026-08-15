import { Slot } from '@askrjs/askr/foundations/structures';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import type {
  MenuGroupAsChildProps,
  MenuGroupProps,
  MenuLabelAsChildProps,
  MenuLabelProps,
  MenuSeparatorAsChildProps,
  MenuSeparatorProps,
} from './menu.types';

/**
 * Renders the `menu-group` part of `menu` with `role="group"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function MenuGroup(props: MenuGroupProps): JSX.Element;
export function MenuGroup(props: MenuGroupAsChildProps): JSX.Element;
export function MenuGroup(props: MenuGroupProps | MenuGroupAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'menu-group',
    role: 'group',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

/**
 * Renders the `menu-label` part of `menu`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function MenuLabel(props: MenuLabelProps): JSX.Element | null;
export function MenuLabel(props: MenuLabelAsChildProps): JSX.Element | null;
export function MenuLabel(props: MenuLabelProps | MenuLabelAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'menu-label',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

/**
 * Renders the `menu-separator` part of `menu` with `role="separator"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function MenuSeparator(props: MenuSeparatorProps): JSX.Element | null;
export function MenuSeparator(
  props: MenuSeparatorAsChildProps
): JSX.Element | null;
export function MenuSeparator(
  props: MenuSeparatorProps | MenuSeparatorAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'menu-separator',
    role: 'separator',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
