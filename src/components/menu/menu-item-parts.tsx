import { Slot } from '@askrjs/askr/foundations/structures';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import type { MenuItemPartAsChildProps, MenuItemPartProps } from './menu.types';

type PartProps = MenuItemPartProps | MenuItemPartAsChildProps;

function MenuItemPart(props: PartProps, slot: string) {
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, { ref, 'data-slot': slot });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <span {...finalProps}>{children}</span>;
}

/** Optional leading visual for a Menu Item. */
export function MenuItemIcon(props: MenuItemPartProps): JSX.Element;
export function MenuItemIcon(props: MenuItemPartAsChildProps): JSX.Element;
export function MenuItemIcon(props: PartProps) {
  return MenuItemPart(props, 'menu-item-icon');
}

/** Primary visible label for a structured Menu Item. */
export function MenuItemLabel(props: MenuItemPartProps): JSX.Element;
export function MenuItemLabel(props: MenuItemPartAsChildProps): JSX.Element;
export function MenuItemLabel(props: PartProps) {
  return MenuItemPart(props, 'menu-item-label');
}

/** Optional supporting description for a structured Menu Item. */
export function MenuItemDescription(props: MenuItemPartProps): JSX.Element;
export function MenuItemDescription(
  props: MenuItemPartAsChildProps
): JSX.Element;
export function MenuItemDescription(props: PartProps) {
  return MenuItemPart(props, 'menu-item-description');
}
