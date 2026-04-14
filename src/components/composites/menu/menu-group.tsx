import { Slot, mergeProps } from '@askrjs/askr/foundations';
import { readMenuDeclarationContext } from './menu.shared';
import type {
  MenuGroupAsChildProps,
  MenuGroupProps,
  MenuLabelAsChildProps,
  MenuLabelProps,
  MenuSeparatorAsChildProps,
  MenuSeparatorProps,
} from './menu.types';

export function MenuGroup(props: MenuGroupProps): JSX.Element;
export function MenuGroup(props: MenuGroupAsChildProps): JSX.Element;
export function MenuGroup(props: MenuGroupProps | MenuGroupAsChildProps) {
  const { asChild, children, ref, ...rest } = props;

  if (readMenuDeclarationContext()) {
    return <>{children}</>;
  }

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

export function MenuLabel(props: MenuLabelProps): JSX.Element | null;
export function MenuLabel(props: MenuLabelAsChildProps): JSX.Element | null;
export function MenuLabel(props: MenuLabelProps | MenuLabelAsChildProps) {
  if (readMenuDeclarationContext()) {
    return null;
  }

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

export function MenuSeparator(props: MenuSeparatorProps): JSX.Element | null;
export function MenuSeparator(
  props: MenuSeparatorAsChildProps
): JSX.Element | null;
export function MenuSeparator(
  props: MenuSeparatorProps | MenuSeparatorAsChildProps
) {
  if (readMenuDeclarationContext()) {
    return null;
  }

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
