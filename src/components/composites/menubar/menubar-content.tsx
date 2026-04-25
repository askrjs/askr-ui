import { state } from '@askrjs/askr';
import {
  Presence,
  Slot,
  composeRefs,
  mergeProps,
  rovingFocus,
} from '@askrjs/askr-ui/foundations';
import { DismissableLayer } from '../../composites/dismissable-layer';
import { FocusScope } from '../../composites/focus-scope';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { pathIsOpen } from '../../_internal/hierarchical-menu';
import { getCompositeCollection } from '../../_internal/composite';
import {
  clearOverlayPosition,
  getOverlayNodes,
  syncOverlayPosition,
} from '../../_internal/overlay';
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

function MenubarContentRuntimeNodeView(props: { node: JSX.Element }) {
  return props.node;
}

function MenubarContentRuntimeRenderScopeView(props: {
  renderContext: ReturnType<typeof createMenubarContentRenderContext>;
  node: JSX.Element;
}) {
  return (
    <MenubarContentRenderContext.Scope value={props.renderContext}>
      <MenubarContentRuntimeNodeView node={props.node} />
    </MenubarContentRenderContext.Scope>
  );
}

function MenubarContentRuntimeScopeView(props: {
  contentContext: MenubarContentContextValue;
  renderContext: ReturnType<typeof createMenubarContentRenderContext>;
  node: JSX.Element;
}) {
  return (
    <MenubarContentContext.Scope value={props.contentContext}>
      <MenubarContentRuntimeRenderScopeView
        renderContext={props.renderContext}
        node={props.node}
      />
    </MenubarContentContext.Scope>
  );
}

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
  const overlayNodes = getOverlayNodes(contentContext.overlayId);
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

        if (node && open) {
          syncOverlayPosition(contentContext.overlayId, {
            side,
            align,
            sideOffset,
          });
        } else {
          clearOverlayPosition(contentContext.overlayId);
        }

        if (node && open) {
          focusSelectedCollectionItem(collection, currentIndex);
        }
      }
    ),
    id: contentContext.contentId,
    role: 'menu',
    'aria-labelledby': contentContext.triggerId,
    'data-slot': 'menubar-content',
    'data-state': open ? 'open' : 'closed',
    'data-side': side,
    'data-align': align,
    'data-side-offset': String(sideOffset),
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
  const contentNode = asChild ? (
    <Slot asChild {...finalProps} children={children as JSX.Element} />
  ) : (
    <div {...finalProps}>{children}</div>
  );
  const scopedContentNode = (
    <MenubarContentRuntimeScopeView
      contentContext={contentContext}
      renderContext={runtimeRenderContext}
      node={contentNode}
    />
  );

  return (
    <Presence present={forceMount || open}>
      <FocusScope restoreFocus>
        <DismissableLayer
          onDismiss={() => {
            root.setOpenPath(contentContext.path.slice(0, -1));
          }}
        >
          {scopedContentNode}
        </DismissableLayer>
      </FocusScope>
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
    path: sub.path,
  });
}
