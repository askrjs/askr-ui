import { Slot, mergeProps } from '@askrjs/askr/foundations';
import type {
  DropdownGroupAsChildProps,
  DropdownGroupProps,
  DropdownLabelAsChildProps,
  DropdownLabelProps,
  DropdownSeparatorAsChildProps,
  DropdownSeparatorProps,
} from './dropdown.types';

export function DropdownGroup(
  props: DropdownGroupProps | DropdownGroupAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    role: 'group',
    'data-slot': 'dropdown-group',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function DropdownLabel(
  props: DropdownLabelProps | DropdownLabelAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'dropdown-label',
    'data-dropdown-label': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function DropdownSeparator(
  props: DropdownSeparatorProps | DropdownSeparatorAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    role: 'separator',
    'data-slot': 'dropdown-separator',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
