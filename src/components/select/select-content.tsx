import { Presence, Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { rovingFocus } from '@askrjs/askr/foundations/interactions';
import { DismissableLayer } from '../dismissable-layer';
import { FocusScope } from '../focus-scope';
import { focusSelectedCollectionItem } from '../_internal/focus';
import { getMenuCollection } from '../_internal/menu';
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
  const hasEnabledItems =
    items.length > 0 && disabledIndexes.length < items.length;
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const finalProps = mergeProps(rest, {
    ...nav.container,
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

        if (node && root.open && hasEnabledItems) {
          focusSelectedCollectionItem(collection, currentIndex);
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
