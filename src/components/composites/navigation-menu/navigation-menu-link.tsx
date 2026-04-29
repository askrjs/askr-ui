import {
  Slot,
  composeRefs,
  mergeProps,
  rovingFocus,
} from '@askrjs/ui/foundations';
import {
  registerCompositeNode,
  getCompositeCollection,
} from '../../_internal/composite';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { getOverlayNodes } from '../../_internal/overlay';
import { resolvePartId } from '../../_internal/id';
import {
  readNavigationMenuRootContext,
  readNavigationMenuItemContext,
  readNavigationMenuContentContext,
} from './navigation-menu.shared';
import type {
  NavigationMenuLinkProps,
  NavigationMenuLinkAsChildProps,
} from './navigation-menu.types';

export function NavigationMenuLink(props: NavigationMenuLinkProps): JSX.Element;
export function NavigationMenuLink(
  props: NavigationMenuLinkAsChildProps
): JSX.Element;
export function NavigationMenuLink(
  props: NavigationMenuLinkProps | NavigationMenuLinkAsChildProps
) {
  const { asChild, children, disabled = false, ref, ...rest } = props;

  const root = readNavigationMenuRootContext();
  const item = readNavigationMenuItemContext();
  const content = readNavigationMenuContentContext();

  const collection = getCompositeCollection(content.contentId);
  const href = (rest as { href?: string }).href;
  const surfaceKey = `link:${item.path.join('/')}:${href ?? String(children)}`;
  const surfaceIndex = content.registerSurface(surfaceKey);
  const nav = rovingFocus({
    currentIndex: content.contentCurrentIndex,
    itemCount: Math.max(content.contentItemCount, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => content.contentDisabledIndexes.includes(index),
    onNavigate: (index) => {
      content.setContentCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });

  const surfaceId = resolvePartId(content.contentId, `item-${surfaceIndex}`);

  const finalProps = mergeProps(rest, {
    ...nav.item(surfaceIndex),
    ref: composeRefs(ref as any, (node: HTMLElement | null) => {
      registerCompositeNode(surfaceId, collection, node, {
        index: surfaceIndex,
        disabled,
      });
    }),
    id: surfaceId,
    'data-slot': 'navigation-menu-link',
    'data-navigation-menu-link': 'true',
    onClick: () => {
      root.setOpenPath([]);
    },
  });

  return asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <a {...finalProps}>{children}</a>
  );
}
