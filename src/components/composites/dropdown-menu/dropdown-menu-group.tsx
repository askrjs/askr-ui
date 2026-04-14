import { Slot, mergeProps } from '@askrjs/askr/foundations';
import { readDropdownMenuDeclarationContext } from './dropdown-menu.shared';
import type {
  DropdownMenuGroupAsChildProps,
  DropdownMenuGroupProps,
  DropdownMenuLabelAsChildProps,
  DropdownMenuLabelProps,
  DropdownMenuSeparatorAsChildProps,
  DropdownMenuSeparatorProps,
} from './dropdown-menu.types';

export function DropdownMenuGroup(
  props: DropdownMenuGroupProps | DropdownMenuGroupAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;

  if (readDropdownMenuDeclarationContext()) {
    return <>{children}</>;
  }

  const finalProps = mergeProps(rest, {
    ref,
    role: 'group',
    'data-slot': 'dropdown-menu-group',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function DropdownMenuLabel(
  props: DropdownMenuLabelProps | DropdownMenuLabelAsChildProps
) {
  if (readDropdownMenuDeclarationContext()) {
    return null;
  }

  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'dropdown-menu-label',
    'data-dropdown-menu-label': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function DropdownMenuSeparator(
  props: DropdownMenuSeparatorProps | DropdownMenuSeparatorAsChildProps
) {
  if (readDropdownMenuDeclarationContext()) {
    return null;
  }

  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    role: 'separator',
    'data-slot': 'dropdown-menu-separator',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
