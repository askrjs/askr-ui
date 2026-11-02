import { Slot } from '@askrjs/askr/foundations/structures';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import { nativeRef } from '../_internal/native-ref';
import { resolveMenubarSlotRef } from './menubar.shared';
import type {
  MenubarGroupAsChildProps,
  MenubarGroupProps,
  MenubarLabelAsChildProps,
  MenubarLabelProps,
  MenubarSeparatorAsChildProps,
  MenubarSeparatorProps,
} from './menubar.types';

/**
 * Renders the `menubar-group` part of `menubar` with `role="group"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function MenubarGroup(
  props: MenubarGroupProps | MenubarGroupAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const slotRef = resolveMenubarSlotRef(asChild, children, ref as Ref<Element>);

  const finalProps = mergeProps(rest, {
    ref: slotRef,
    role: 'group',
    'data-slot': 'menubar-group',
  });

  return asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps} ref={nativeRef<HTMLDivElement>(props)}>
      {children}
    </div>
  );
}

/**
 * Renders the `menubar-label` part of `menubar`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function MenubarLabel(
  props: MenubarLabelProps | MenubarLabelAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const slotRef = resolveMenubarSlotRef(asChild, children, ref as Ref<Element>);
  const finalProps = mergeProps(rest, {
    ref: slotRef,
    'data-slot': 'menubar-label',
    'data-menubar-label': 'true',
  });

  return asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps} ref={nativeRef<HTMLDivElement>(props)}>
      {children}
    </div>
  );
}

/**
 * Renders the `menubar-separator` part of `menubar` with `role="separator"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function MenubarSeparator(
  props: MenubarSeparatorProps | MenubarSeparatorAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const slotRef = resolveMenubarSlotRef(asChild, children, ref as Ref<Element>);
  const finalProps = mergeProps(rest, {
    ref: slotRef,
    role: 'separator',
    'data-slot': 'menubar-separator',
  });

  return asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps} ref={nativeRef<HTMLDivElement>(props)}>
      {children}
    </div>
  );
}
