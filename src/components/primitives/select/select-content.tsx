import {
  Presence,
  Slot,
  composeRefs,
  mergeProps,
  rovingFocus,
} from '@askrjs/askr/foundations';
import { DismissableLayer } from '../../composites/dismissable-layer';
import { FocusScope } from '../../composites/focus-scope';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { getMenuCollection } from '../../_internal/menu';
import {
  clearOverlayPosition,
  getOverlayNodes,
  syncOverlayPosition,
} from '../../_internal/overlay';
import {
  getSelectDisabledIndexes,
  readSelectRenderContext,
  readSelectRootContext,
  resolveSelectState,
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
  const { items, currentIndex } = resolveSelectState(root);
  const overlayNodes = getOverlayNodes(root.selectId);
  const collection = getMenuCollection(root.selectId);
  const disabledIndexes = getSelectDisabledIndexes(items, root.disabled);
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
          syncOverlayPosition(root.selectId, {
            side,
            align,
            sideOffset,
            matchTriggerWidth: true,
          });
        } else {
          clearOverlayPosition(root.selectId);
        }

        if (node && root.open) {
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
    <SelectRootContext.Scope value={root}>
      <SelectRenderContext.Scope value={renderContext}>
        {contentNode}
      </SelectRenderContext.Scope>
    </SelectRootContext.Scope>
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
