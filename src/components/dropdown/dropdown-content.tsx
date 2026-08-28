import { Presence, Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { rovingFocus } from '../_internal/roving-focus';
import { DismissableLayer } from '../dismissable-layer';
import { FocusScope } from '../focus-scope';
import { claimOpenAutoFocus, dismissPopupWithTab } from '../_internal/focus';
import { getMenuCollection, getMenuCollectionItems } from '../_internal/menu';
import {
  clearOverlayPosition,
  getOverlayNodes,
  OVERLAY_Z_INDEX,
  registerOverlayNode,
  syncOverlayPosition,
} from '../_internal/overlay';
import { readDropdownRootContext } from './dropdown.shared';
import type {
  DropdownContentAsChildProps,
  DropdownContentProps,
} from './dropdown.types';

/**
 * Renders a part of `dropdown`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function DropdownContent(
  props: DropdownContentProps
): JSX.Element | null;
export function DropdownContent(
  props: DropdownContentAsChildProps
): JSX.Element | null;
export function DropdownContent(
  props: DropdownContentProps | DropdownContentAsChildProps
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
  const root = readDropdownRootContext();
  claimOpenAutoFocus(root.overlayIdentity, root.open, null);
  const { items, currentIndex, disabledIndexes } = root.resolvedState;
  const hasEnabledItems = items.some(
    (_item, index) => !disabledIndexes.includes(index)
  );
  const overlayNodes = getOverlayNodes(root.overlayIdentity);
  const collection = getMenuCollection(root.dropdownId);
  const overlayNodeOwner = {};
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(root.resolvedState.itemCount, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledIndexes.includes(index),
    onNavigate: (index) => {
      if (!hasEnabledItems) {
        return;
      }

      root.setCurrentIndex(index);
      root.focusItem(index);
    },
  });
  const setNode = (node: HTMLElement | null) => {
    registerOverlayNode(
      root.overlayIdentity,
      'content',
      node,
      overlayNodeOwner
    );

    if (node && root.open) {
      syncOverlayPosition(root.overlayIdentity, root.dropdownId, {
        side,
        align,
        sideOffset,
        zIndex: OVERLAY_Z_INDEX.dropdown,
      });
    } else {
      clearOverlayPosition(root.overlayIdentity);
    }

    if (claimOpenAutoFocus(root.overlayIdentity, root.open, node)) {
      queueMicrotask(() => {
        if (
          overlayNodes.content !== node ||
          !node.isConnected ||
          node.contains(document.activeElement)
        ) {
          return;
        }

        const liveItems = getMenuCollectionItems(collection);
        const target =
          liveItems.find(
            (item) => item.index === currentIndex && !item.disabled
          ) ?? liveItems.find((item) => !item.disabled);

        if (target) {
          root.focusItem(target.index);
        }
      });
    }
  };
  const refHandler = ref
    ? composeRefs(
        ref as
          | ((value: HTMLElement | null) => void)
          | { current: HTMLElement | null }
          | null
          | undefined,
        setNode
      )
    : setNode;
  const finalProps = mergeProps(rest, {
    ref: refHandler,
    id: root.contentId,
    role: 'menu',
    'data-slot': 'dropdown-content',
    'data-state': root.open ? 'open' : 'closed',
    'data-side': side,
    'data-align': align,
    'data-side-offset': String(sideOffset),
    onKeyDown: (event: KeyboardEvent) => {
      if (root.handleTypeaheadKeyDown(event)) {
        return;
      }

      nav.container.onKeyDown?.(event);

      if (event.defaultPrevented) {
        return;
      }

      dismissPopupWithTab(
        event,
        overlayNodes.trigger,
        overlayNodes.content ? [overlayNodes.content] : [],
        () => {
          root.setOpen(false);
        }
      );
    },
  });
  const contentNode = asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );

  return (
    <Presence present={forceMount || root.open}>
      <FocusScope
        restoreFocus
        restoreFocusTarget={() => overlayNodes.trigger}
      >
        <DismissableLayer
          onDismiss={() => {
            root.setOpen(false);
          }}
        >
          {contentNode}
        </DismissableLayer>
      </FocusScope>
    </Presence>
  );
}
