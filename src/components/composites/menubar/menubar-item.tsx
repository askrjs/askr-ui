import {
  Slot,
  composeRefs,
  mergeProps,
  pressable,
  rovingFocus,
} from '@askrjs/ui/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { resolvePartId } from '../../_internal/id';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import { pathIsOpen } from '../../_internal/hierarchical-menu';
import { getOverlayNodes } from '../../_internal/overlay';
import {
  getCompositeCollection,
  registerCompositeNode,
} from '../../_internal/composite';
import {
  MenubarSubContext,
  readMenubarContentContext,
  readMenubarContentRenderContext,
  readMenubarRootContext,
  readOptionalMenubarRootContext,
  readMenubarSubContext,
  resolveMenubarContentState,
  type MenubarSubContextValue,
} from './menubar.shared';
import type {
  MenubarItemAsChildProps,
  MenubarItemProps,
  MenubarSubProps,
  MenubarSubTriggerAsChildProps,
  MenubarSubTriggerProps,
} from './menubar.types';

function MenubarSubScopeView(props: { children?: unknown }) {
  const keyedChildren = toChildArray(props.children).map((child, index) => {
    if (!isJsxElement(child) || child.key != null) {
      return child;
    }

    return {
      ...child,
      key: `menubar-sub-${index}`,
    };
  });

  return <>{keyedChildren}</>;
}

function scheduleMenubarPortalSync(root: { syncPortals: () => void }) {
  queueMicrotask(() => {
    root.syncPortals();
  });
}

export function MenubarItem(props: MenubarItemProps): JSX.Element | null;
export function MenubarItem(props: MenubarItemAsChildProps): JSX.Element | null;
export function MenubarItem(props: MenubarItemProps | MenubarItemAsChildProps) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const content = readMenubarContentContext();
  const renderContext = readMenubarContentRenderContext();
  const surfaceIndex = renderContext.claimSurfaceIndex();

  const root = readOptionalMenubarRootContext();

  if (!root) {
    return null;
  }

  const surfaceId = resolvePartId(content.contentId, `item-${surfaceIndex}`);
  const { items, currentIndex, disabledItemIndexes } =
    resolveMenubarContentState(content);
  const collection = getCompositeCollection(content.contentId);
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledItemIndexes.includes(index),
    onNavigate: (index) => {
      content.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        root.setOpenPath([]);
        scheduleMenubarPortalSync(root);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...nav.item(surfaceIndex),
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        registerCompositeNode(surfaceId, collection, node, {
          index: surfaceIndex,
          disabled,
        });
      }
    ),
    id: surfaceId,
    role: 'menuitem',
    'aria-disabled': disabled ? 'true' : undefined,
    'data-slot': 'menubar-item',
    'data-disabled': disabled ? 'true' : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}

export function MenubarSub(props: MenubarSubProps) {
  const content = readMenubarContentContext();
  const renderContext = readMenubarContentRenderContext();
  const surfaceIndex = renderContext.claimSurfaceIndex();
  const subKey = props.value ?? `sub-${surfaceIndex}`;
  const subContext: MenubarSubContextValue = {
    surfaceIndex,
    triggerId: resolvePartId(content.contentId, `sub-trigger-${surfaceIndex}`),
    contentId: resolvePartId(content.contentId, `sub-content-${surfaceIndex}`),
    path: [...content.path, subKey],
  };

  return (
    <MenubarSubContext.Scope value={subContext}>
      <MenubarSubScopeView>{props.children}</MenubarSubScopeView>
    </MenubarSubContext.Scope>
  );
}

export function MenubarSubTrigger(
  props: MenubarSubTriggerProps
): JSX.Element | null;
export function MenubarSubTrigger(
  props: MenubarSubTriggerAsChildProps
): JSX.Element | null;
export function MenubarSubTrigger(
  props: MenubarSubTriggerProps | MenubarSubTriggerAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const content = readMenubarContentContext();
  const sub = readMenubarSubContext();

  const root = readOptionalMenubarRootContext();

  if (!root) {
    return null;
  }

  const { items, currentIndex, disabledItemIndexes } =
    resolveMenubarContentState(content);
  const collection = getCompositeCollection(content.contentId);
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledItemIndexes.includes(index),
    onNavigate: (index) => {
      content.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const open = pathIsOpen(root.openPath, sub.path);
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        content.setCurrentIndex(sub.surfaceIndex);
        root.setOpenPath(open ? content.path : sub.path);
        scheduleMenubarPortalSync(root);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...nav.item(sub.surfaceIndex),
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        getOverlayNodes(sub.triggerId).trigger = node;
        registerCompositeNode(sub.triggerId, collection, node, {
          index: sub.surfaceIndex,
          disabled,
        });
      }
    ),
    id: sub.triggerId,
    role: 'menuitem',
    'aria-haspopup': 'menu',
    'aria-expanded': open ? 'true' : 'false',
    'aria-controls': sub.contentId,
    'data-slot': 'menubar-sub-trigger',
    'data-state': open ? 'open' : 'closed',
    'data-disabled': disabled ? 'true' : undefined,
    onPointerEnter: () => {
      if (!disabled) {
        content.setCurrentIndex(sub.surfaceIndex);
        root.setOpenPath(sub.path);
        scheduleMenubarPortalSync(root);
      }
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        content.setCurrentIndex(sub.surfaceIndex);
        root.setOpenPath(sub.path);
        scheduleMenubarPortalSync(root);
      }
    },
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}

