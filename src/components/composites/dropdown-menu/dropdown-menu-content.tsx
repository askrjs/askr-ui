import {
  Presence,
  Slot,
  composeRefs,
  mergeProps,
  rovingFocus,
} from '@askrjs/ui/foundations';
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
  readDropdownMenuRootContext,
  resolveDropdownMenuState,
} from './dropdown-menu.shared';
import type {
  DropdownMenuContentAsChildProps,
  DropdownMenuContentProps,
} from './dropdown-menu.types';

export function DropdownMenuContent(
  props: DropdownMenuContentProps
): JSX.Element | null;
export function DropdownMenuContent(
  props: DropdownMenuContentAsChildProps
): JSX.Element | null;
export function DropdownMenuContent(
  props: DropdownMenuContentProps | DropdownMenuContentAsChildProps
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
  const root = readDropdownMenuRootContext();
  const { items, currentIndex, disabledIndexes } =
    resolveDropdownMenuState(root);
  const hasEnabledItems = items.some(
    (_item, index) => !disabledIndexes.includes(index)
  );
  const overlayNodes = getOverlayNodes(root.dropdownMenuId);
  const collection = getMenuCollection(root.dropdownMenuId);
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
          syncOverlayPosition(root.dropdownMenuId, {
            side,
            align,
            sideOffset,
          });
        } else {
          clearOverlayPosition(root.dropdownMenuId);
        }

        if (node && root.open && hasEnabledItems) {
          focusSelectedCollectionItem(collection, currentIndex);
        }
      }
    ),
    id: root.contentId,
    role: 'menu',
    'data-slot': 'dropdown-menu-content',
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

