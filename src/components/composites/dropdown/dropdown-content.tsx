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
  readDropdownRootContext,
  resolveDropdownState,
} from './dropdown.shared';
import type {
  DropdownContentAsChildProps,
  DropdownContentProps,
} from './dropdown.types';

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
  const { items, currentIndex, disabledIndexes } = resolveDropdownState(root);
  const hasEnabledItems = items.some(
    (_item, index) => !disabledIndexes.includes(index)
  );
  const overlayNodes = getOverlayNodes(root.dropdownId);
  const collection = getMenuCollection(root.dropdownId);
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) =>
      hasEnabledItems ? disabledIndexes.includes(index) : false,
    onNavigate: (index) => {
      if (!hasEnabledItems) {
        return;
      }

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
          syncOverlayPosition(root.dropdownId, {
            side,
            align,
            sideOffset,
          });
        } else {
          clearOverlayPosition(root.dropdownId);
        }

        if (node && root.open && hasEnabledItems) {
          focusSelectedCollectionItem(collection, currentIndex);
        }
      }
    ),
    id: root.contentId,
    role: 'menu',
    'data-slot': 'dropdown-content',
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

  return (
    <Presence present={forceMount || root.open}>
      <FocusScope restoreFocus>
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
