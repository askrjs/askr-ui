import { Presence, Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { rovingFocus } from '@askrjs/askr/foundations/interactions';
import { DismissableLayer } from '../dismissable-layer';
import { FocusScope } from '../focus-scope';
import { dismissPopupWithTab } from '../_internal/focus';
import { getMenuCollection, getMenuCollectionItems } from '../_internal/menu';
import {
  clearOverlayPosition,
  getOverlayNodes,
  OVERLAY_Z_INDEX,
  syncOverlayPosition,
} from '../_internal/overlay';
import {
  readSelectRenderContext,
  readSelectRootContext,
  SelectRenderContext,
  SelectRootContext,
} from './select.shared';
import type {
  SelectContentAsChildProps,
  SelectContentProps,
} from './select.types';

/**
 * Renders a part of `select` with `role="listbox"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function SelectContent(props: SelectContentProps): JSX.Element | null;
export function SelectContent(
  props: SelectContentAsChildProps
): JSX.Element | null;
export function SelectContent(
  props: SelectContentProps | SelectContentAsChildProps
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

  const root = readSelectRootContext();
  const renderContext = readSelectRenderContext();
  const { items, currentIndex, disabledIndexes } = root.resolvedState;
  const overlayNodes = getOverlayNodes(root.overlayIdentity);
  const collection = getMenuCollection(root.selectId);
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentIndex(index);
      root.focusItem(index);
    },
  });
  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        overlayNodes.content = node;
        if (node && root.open) {
          syncOverlayPosition(root.overlayIdentity, root.selectId, {
            side,
            align,
            sideOffset,
            matchTriggerWidth: true,
            zIndex: OVERLAY_Z_INDEX.dropdown,
          });
        } else {
          clearOverlayPosition(root.overlayIdentity);
        }

        if (node && root.open) {
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
      }
    ),
    id: root.contentId,
    role: 'listbox',
    'data-slot': 'select-content',
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
  const scopedContentNode = (
    <SelectRootContext value={root}>
      <SelectRenderContext value={renderContext}>
        {contentNode}
      </SelectRenderContext>
    </SelectRootContext>
  );

  return (
    <Presence present={forceMount || root.open}>
      <FocusScope restoreFocus>
        <DismissableLayer
          onDismiss={() => {
            root.setOpen(false);
          }}
        >
          {scopedContentNode}
        </DismissableLayer>
      </FocusScope>
    </Presence>
  );
}
