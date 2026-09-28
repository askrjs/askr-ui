import { Slot } from '@askrjs/askr/foundations/structures';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import { nativeRef } from '../_internal/native-ref';
import type {
  DropdownGroupAsChildProps,
  DropdownGroupProps,
  DropdownLabelAsChildProps,
  DropdownLabelProps,
  DropdownSeparatorAsChildProps,
  DropdownSeparatorProps,
} from './dropdown.types';

/**
 * Renders the `dropdown-group` part of `dropdown` with `role="group"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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

  return (
    <div {...finalProps} ref={nativeRef<HTMLDivElement>(props)}>
      {children}
    </div>
  );
}

/**
 * Renders the `dropdown-label` part of `dropdown`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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

  return (
    <div {...finalProps} ref={nativeRef<HTMLDivElement>(props)}>
      {children}
    </div>
  );
}

/**
 * Renders the `dropdown-separator` part of `dropdown` with `role="separator"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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

  return (
    <div {...finalProps} ref={nativeRef<HTMLDivElement>(props)}>
      {children}
    </div>
  );
}
