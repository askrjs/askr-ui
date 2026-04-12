import { state } from '@askrjs/askr';
import { Slot, composeRefs, mergeProps, rovingFocus, Presence } from '@askrjs/askr/foundations';
import { DismissableLayer } from '../../composites/dismissable-layer';
import { FocusScope } from '../../composites/focus-scope';
import {
  registerCompositeNode,
  getCompositeCollection,
  firstEnabledCompositeIndex,
  disabledIndexes,
} from '../../_internal/composite';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import {
  getOverlayNodes,
  getPersistentPortal,
  syncOverlayPosition,
  clearOverlayPosition,
} from '../../_internal/overlay';
import { resolvePartId } from '../../_internal/id';
import {
  collectSurfaceElements,
  pathIsOpen,
} from '../../_internal/hierarchical-menu';
import { stripInternalProps } from '../../_internal/props';
import { collectJsxElements } from '../../_internal/jsx';
import {
  NavigationMenuContentContext,
  type NavigationMenuContentContextValue,
  type NavigationMenuPositionOptions,
  readNavigationMenuRootContext,
  readNavigationMenuItemContext,
} from './navigation-menu.shared';
import { NavigationMenuLink } from './navigation-menu-link';
import { NavigationMenuSub } from './navigation-menu-sub';
import { NavigationMenuSubContent } from './navigation-menu-sub-content';
import { NavigationMenuSubTrigger } from './navigation-menu-sub-trigger';
import type {
  NavigationMenuContentProps,
  NavigationMenuContentAsChildProps,
} from './navigation-menu.types';

function NavigationMenuContentScopeView(props: {
  node: JSX.Element;
  contentContextValue: NavigationMenuContentContextValue;
}) {
  return (
    <NavigationMenuContentContext.Scope value={props.contentContextValue}>
      <NavigationMenuContentRuntimeNodeView node={props.node} />
    </NavigationMenuContentContext.Scope>
  );
}

function NavigationMenuContentRuntimeNodeView(props: { node: JSX.Element }) {
  return props.node;
}

function collectContentItems(children: unknown) {
  return collectSurfaceElements(
    children,
    (element) =>
      element.type === NavigationMenuLink || element.type === NavigationMenuSub,
    (element) => element.type === NavigationMenuSubContent
  ).map((element) => ({
    disabled:
      element.type === NavigationMenuLink
        ? Boolean(element.props?.disabled)
        : Boolean(
            collectJsxElements(
              element.props?.children,
              (child) => child.type === NavigationMenuSubTrigger
            )[0]?.props?.disabled
          ),
  }));
}

export function NavigationMenuContent(
  props: NavigationMenuContentProps
): JSX.Element | null;
export function NavigationMenuContent(
  props: NavigationMenuContentAsChildProps
): JSX.Element | null;
export function NavigationMenuContent(
  props:
    | NavigationMenuContentProps
    | NavigationMenuContentAsChildProps
) {
  const {
    asChild,
    children,
    forceMount = false,
    ref,
    side = 'bottom',
    align = 'start',
    sideOffset = 0,
    ...rest
  } = props;

  const root = readNavigationMenuRootContext();
  const item = readNavigationMenuItemContext();

  const items = collectContentItems(children);
  const currentIndexState = state(firstEnabledCompositeIndex(items));
  const currentIndex = items[currentIndexState()]
    ? currentIndexState()
    : firstEnabledCompositeIndex(items);

  const contentContextValue: NavigationMenuContentContextValue = {
    contentCurrentIndex: currentIndex,
    setContentCurrentIndex: currentIndexState.set,
    contentItemCount: items.length,
    contentDisabledIndexes: disabledIndexes(items),
    contentId: item.contentId,
  };

  const open = pathIsOpen(root.openPath, item.path);
  const overlayId = item.triggerId;
  const portal = getPersistentPortal(overlayId);
  const overlayNodes = getOverlayNodes(overlayId);
  const collection = getCompositeCollection(item.contentId);

  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledIndexes(items).includes(index),
    onNavigate: (index) => {
      currentIndexState.set(index);
      focusSelectedCollectionItem(collection, index);
    },
  });

  const finalProps = mergeProps(rest, {
    ...nav.container,
    ref: composeRefs(
      ref as any,
      (node: HTMLElement | null) => {
        overlayNodes.content = node;
        if (node && open) {
          syncOverlayPosition(overlayId, {
            side,
            align,
            sideOffset,
          });
        } else {
          clearOverlayPosition(overlayId);
        }

        if (node && open) {
          focusSelectedCollectionItem(collection, currentIndex);
        }
      }
    ),
    id: item.contentId,
    'aria-labelledby': item.triggerId,
    'data-slot': 'navigation-menu-content',
    'data-state': open ? 'open' : 'closed',
    'data-side': side,
    'data-align': align,
    'data-side-offset': String(sideOffset),
  });

  const contentNode = asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );

  const rendered = (
    <Presence present={forceMount || open}>
      <FocusScope restoreFocus>
        <DismissableLayer
          onDismiss={() => {
            root.setOpenPath(item.path.slice(0, -1));
          }}
        >
          <NavigationMenuContentScopeView
            contentContextValue={contentContextValue}
            node={contentNode}
          />
        </DismissableLayer>
      </FocusScope>
    </Presence>
  );

  const PortalHost = portal;

  return (
    <>
      {portal.render({
        children: rendered,
      })}
      {PortalHost ? <PortalHost /> : null}
    </>
  );
}
