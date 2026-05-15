import { Slot, mergeProps } from '@askrjs/askr/foundations';
import { readMenuRootContext } from './menu.shared';
import type { MenuContentAsChildProps, MenuContentProps } from './menu.types';

export function MenuContent(props: MenuContentProps): JSX.Element;
export function MenuContent(props: MenuContentAsChildProps): JSX.Element;
export function MenuContent(props: MenuContentProps | MenuContentAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const root = readMenuRootContext();
  const finalProps = mergeProps(rest, {
    ...root.navigation.container,
    ref,
    'data-slot': 'menu-content',
    'data-orientation': root.orientation,
    role: 'menu',
    'aria-orientation':
      root.orientation === 'both' ? undefined : root.orientation,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return <div {...finalProps}>{children}</div>;
}
