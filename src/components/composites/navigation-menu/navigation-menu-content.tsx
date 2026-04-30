import { state } from '@askrjs/askr';
import {
  Slot,
  composeRefs,
  mergeProps,
  rovingFocus,
  Presence,
} from '@askrjs/askr/foundations';
import { DismissableLayer } from '../../composites/dismissable-layer';
import { FocusScope } from '../../composites/focus-scope';
import {
  getCompositeCollection,
  getCompositeCollectionItems,
} from '../../_internal/composite';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import {
  getOverlayNodes,
  getPersistentPortal,
  syncOverlayPosition,
  clearOverlayPosition,
} from '../../_internal/overlay';
import { pathIsOpen } from '../../_internal/hierarchical-menu';
import {
  NavigationMenuContentContext,
  type NavigationMenuContentContextValue,
  readNavigationMenuRootContext,
  readNavigationMenuItemContext,
} from './navigation-menu.shared';
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

export function NavigationMenuContent(
  props: NavigationMenuContentProps
): JSX.Element | null;
export function NavigationMenuContent(
  props: NavigationMenuContentAsChildProps
): JSX.Element | null;
export function NavigationMenuContent(
  props: NavigationMenuContentProps | NavigationMenuContentAsChildProps
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

  const collection = getCompositeCollection(item.contentId);
  const surfaceItems = getCompositeCollectionItems(collection);
  const orderedSurfaceItems = [...surfaceItems].sort(
    (left, right) => left.index - right.index
  );
  const firstEnabledIndex =
    orderedSurfaceItems.find((entry) => !entry.disabled)?.index ?? 0;
  const currentIndexState = state(firstEnabledIndex);
  const currentIndexCandidate = currentIndexState();
  const currentIndex = orderedSurfaceItems.some(
    (entry) => entry.index === currentIndexCandidate && !entry.disabled
  )
    ? currentIndexCandidate
    : firstEnabledIndex;

  const surfaceIndexMap = new Map<string, number>();
  let nextSurfaceIndex = 0;
  const registerSurface = (surfaceKey: string): number => {
    const existingIndex = surfaceIndexMap.get(surfaceKey);

    if (existingIndex !== undefined) {
      return existingIndex;
    }

    const nextIndex = nextSurfaceIndex;
    surfaceIndexMap.set(surfaceKey, nextIndex);
    nextSurfaceIndex += 1;
    return nextIndex;
  };

  const contentDisabledIndexes = orderedSurfaceItems
    .filter((entry) => entry.disabled)
    .map((entry) => entry.index);

  const contentContextValue: NavigationMenuContentContextValue = {
    contentPath: item.path,
    contentCurrentIndex: currentIndex,
    setContentCurrentIndex: currentIndexState.set,
    contentItemCount: orderedSurfaceItems.length,
    contentDisabledIndexes,
    contentId: item.contentId,
    registerSurface,
  };

  const open = pathIsOpen(root.openPath, item.path);
  const overlayId = item.triggerId;
  const portal = getPersistentPortal(overlayId);
  const overlayNodes = getOverlayNodes(overlayId);

  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(orderedSurfaceItems.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => contentDisabledIndexes.includes(index),
    onNavigate: (index) => {
      currentIndexState.set(index);
      focusSelectedCollectionItem(collection, index);
    },
  });

  const finalProps = mergeProps(rest, {
    ...nav.container,
    ref: composeRefs(ref as any, (node: HTMLElement | null) => {
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
    }),
    id: item.contentId,
    'aria-labelledby': item.triggerId,
    'data-slot': 'navigation-menu-content',
    'data-state': open ? 'open' : 'closed',
    'data-side': side,
    'data-align': align,
    'data-side-offset': String(sideOffset),
  });

  const contentNode = asChild ? (
    <Slot
      asChild
      {...finalProps}
      children={
        toChildArray(children).map((child, index) => {
          if (!isJsxElement(child) || child.key != null) {
            return child;
          }

          return {
            ...child,
            key: `navigation-menu-content-${index}`,
          };
        }) as unknown as JSX.Element
      }
    />
  ) : (
    <div {...finalProps}>
      {toChildArray(children).map((child, index) => {
        if (!isJsxElement(child) || child.key != null) {
          return child;
        }

        return {
          ...child,
          key: `navigation-menu-content-${index}`,
        };
      })}
    </div>
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
  portal.render({ children: rendered });

  return <PortalHost />;
}
