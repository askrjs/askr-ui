import { Slot, mergeProps } from '@askrjs/askr/foundations';
import { readMenubarDeclarationContext } from './menubar.shared';
import type {
  MenubarGroupAsChildProps,
  MenubarGroupProps,
  MenubarLabelAsChildProps,
  MenubarLabelProps,
  MenubarSeparatorAsChildProps,
  MenubarSeparatorProps,
} from './menubar.types';

export function MenubarGroup(
  props: MenubarGroupProps | MenubarGroupAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;

  if (readMenubarDeclarationContext()) {
    return <>{children}</>;
  }

  const finalProps = mergeProps(rest, {
    ref,
    role: 'group',
    'data-slot': 'menubar-group',
  });

  return asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );
}

export function MenubarLabel(
  props: MenubarLabelProps | MenubarLabelAsChildProps
) {
  if (readMenubarDeclarationContext()) {
    return null;
  }

  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'menubar-label',
    'data-menubar-label': 'true',
  });

  return asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );
}

export function MenubarSeparator(
  props: MenubarSeparatorProps | MenubarSeparatorAsChildProps
) {
  if (readMenubarDeclarationContext()) {
    return null;
  }

  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    role: 'separator',
    'data-slot': 'menubar-separator',
  });

  return asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );
}
