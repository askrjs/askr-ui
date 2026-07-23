import { state } from '@askrjs/askr';
import { Presence, Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { rovingFocus } from '@askrjs/askr/foundations/interactions';
import { DismissableLayer } from '../dismissable-layer';
import { FocusScope } from '../focus-scope';
import { focusSelectedCollectionItem } from '../_internal/focus';
import { pathIsOpen } from '../_internal/hierarchical-menu';
import { getCompositeCollection } from '../_internal/composite';
import {
  clearOverlayPosition,
  getOverlayNodes,
  OVERLAY_Z_INDEX,
  syncOverlayPosition,
} from '../_internal/overlay';
import {
  createMenubarContentRenderContext,
  MenubarContentContext,
  MenubarContentRenderContext,
  readOptionalMenubarRootContext,
  readMenubarSubContext,
  resolveMenubarContentOwner,
  resolveMenubarContentState,
  type MenubarContentContextValue,
} from './menubar.shared';
import type {
  MenubarContentAsChildProps,
  MenubarContentProps,
  MenubarSubContentAsChildProps,
  MenubarSubContentProps,
} from './menubar.types';

function renderMenubarSurfaceContent(
  props:
    | MenubarContentProps
    | MenubarContentAsChildProps
    | MenubarSubContentProps
    | MenubarSubContentAsChildProps,
  owner: {
    contentId: string;
    triggerId: string;
    overlayId: string;
    overlayIdentity: object;
    path: string[];
  }
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
  const currentIndexState = state(0);
  const contentContext: MenubarContentContextValue = {
    contentId: owner.contentId,
    triggerId: owner.triggerId,
    overlayId: owner.overlayId,
    overlayIdentity: owner.overlayIdentity,
    path: owner.path,
    currentIndexCandidate: currentIndexState(),
    setCurrentIndex: currentIndexState.set,
  };
  const runtimeRenderContext = createMenubarContentRenderContext();

  const root = readOptionalMenubarRootContext();

  if (!root) {
    return null;
  }

  const { items, currentIndex, disabledItemIndexes } =
    resolveMenubarContentState(contentContext);
  const open = pathIsOpen(root.openPath, contentContext.path);
  const overlayNodes = getOverlayNodes(contentContext.overlayIdentity);
  const collection = getCompositeCollection(contentContext.contentId);
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledItemIndexes.includes(index),
    onNavigate: (index) => {
      contentContext.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const setNode = (node: HTMLElement | null) => {
    overlayNodes.content = node;

    if (node && open) {
      syncOverlayPosition(
        contentContext.overlayIdentity,
        contentContext.overlayId,
        {
          side,
          align,
          sideOffset,
          zIndex: OVERLAY_Z_INDEX.dropdown,
        }
      );
    } else {
      clearOverlayPosition(contentContext.overlayIdentity);
    }

    if (node && open) {
      focusSelectedCollectionItem(collection, currentIndex);
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
    ...nav.container,
    ref: refHandler,
    id: contentContext.contentId,
    role: 'menu',
    'aria-labelledby': contentContext.triggerId,
    'data-slot': 'menubar-content',
    'data-state': open ? 'open' : 'closed',
    'data-side': side,
    'data-align': align,
    'data-side-offset': String(sideOffset),
    'data-askr-overlay-id': open ? contentContext.overlayId : undefined,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        root.setOpenPath(contentContext.path.slice(0, -1));
      }

      if (event.key === 'ArrowLeft' && contentContext.path.length > 1) {
        event.preventDefault();
        root.setOpenPath(contentContext.path.slice(0, -1));
      }
    },
  });
  return (
    <Presence present={forceMount || open}>
      <MenubarContentContext value={contentContext}>
        <MenubarContentRenderContext value={runtimeRenderContext}>
          <FocusScope restoreFocus>
            <DismissableLayer
              onDismiss={() => {
                root.setOpenPath(contentContext.path.slice(0, -1));
              }}
            >
              {asChild ? (
                <Slot
                  asChild
                  {...finalProps}
                  children={children as JSX.Element}
                />
              ) : (
                <div {...finalProps}>{children}</div>
              )}
            </DismissableLayer>
          </FocusScope>
        </MenubarContentRenderContext>
      </MenubarContentContext>
    </Presence>
  );
}

export function MenubarContent(props: MenubarContentProps): JSX.Element | null;
export function MenubarContent(
  props: MenubarContentAsChildProps
): JSX.Element | null;
export function MenubarContent(
  props: MenubarContentProps | MenubarContentAsChildProps
) {
  return renderMenubarSurfaceContent(props, resolveMenubarContentOwner());
}

export function MenubarSubContent(
  props: MenubarSubContentProps
): JSX.Element | null;
export function MenubarSubContent(
  props: MenubarSubContentAsChildProps
): JSX.Element | null;
export function MenubarSubContent(
  props: MenubarSubContentProps | MenubarSubContentAsChildProps
) {
  const sub = readMenubarSubContext();
  return renderMenubarSurfaceContent(props, {
    contentId: sub.contentId,
    triggerId: sub.triggerId,
    overlayId: sub.triggerId,
    overlayIdentity: sub.overlayIdentity,
    path: sub.path,
  });
}
