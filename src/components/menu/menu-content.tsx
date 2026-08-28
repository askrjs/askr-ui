import { Slot } from '@askrjs/askr/foundations/structures';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import {
  moveFocusOutsideCompositeWithTab,
} from '../_internal/focus';
import { readMenuRootContext } from './menu.shared';
import type { MenuContentAsChildProps, MenuContentProps } from './menu.types';

/**
 * Renders the `menu-content` part of `menu` with `role="menu"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function MenuContent(props: MenuContentProps): JSX.Element;
export function MenuContent(props: MenuContentAsChildProps): JSX.Element;
export function MenuContent(props: MenuContentProps | MenuContentAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const root = readMenuRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'menu-content',
    'data-orientation': root.orientation,
    role: 'menu',
    'aria-orientation':
      root.orientation === 'both' ? undefined : root.orientation,
    onKeyDown: (event: KeyboardEvent) => {
      if (root.handleTypeaheadKeyDown(event)) {
        return;
      }

      if (event.key === 'Home' || event.key === 'End') {
        const enabledItems = root.resolvedState.items.filter(
          (item) => !item.disabled
        );
        const item =
          event.key === 'Home'
            ? enabledItems[0]
            : enabledItems[enabledItems.length - 1];

        if (item) {
          event.preventDefault();
          root.setCurrentIndex(item.index);
          root.focusItem(item.index);
          return;
        }
      }

      root.navigation.container.onKeyDown?.(event);

      if (!event.defaultPrevented) {
        moveFocusOutsideCompositeWithTab(
          event,
          event.currentTarget as HTMLElement
        );
      }
    },
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return <div {...finalProps}>{children}</div>;
}
