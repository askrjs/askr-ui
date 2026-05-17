import { state } from '@askrjs/askr';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import { rovingFocus } from '@askrjs/askr/foundations/interactions';
import { focusSelectedCollectionItem } from '../_internal/focus';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import { getCompositeCollection } from '../_internal/composite';
import { collectJsxElements } from '../_internal/jsx';
import { getPersistentPortal } from '../_internal/overlay';
import { MenubarMenu } from './menubar-menu';
import {
  createMenubarRootRenderContext,
  MenubarRootContext,
  MenubarRootRenderContext,
  resolveMenubarRootState,
  type MenubarRootStateInput,
  type MenubarRootContextValue,
} from './menubar.shared';
import type { MenubarProps } from './menubar.types';

export function Menubar(props: MenubarProps) {
  const { children, id, loop = true, ref, ...rest } = props;
  const menubarId = resolveCompoundId('menubar', id, children);
  const openPathState = state<string[]>([]);
  const portalEpochState = state(0);
  const currentTriggerIndexState = state(0);
  const setOpenPath = (path: string[]) => {
    openPathState.set(path);
  };
  const setCurrentTriggerIndex = (index: number) => {
    currentTriggerIndexState.set(index);
  };
  const rootContextBase: MenubarRootStateInput = {
    menubarId,
    currentTriggerIndexCandidate: currentTriggerIndexState(),
  };
  const runtimeRenderContext = createMenubarRootRenderContext();
  const rootState = resolveMenubarRootState(rootContextBase);
  const rootContext: MenubarRootContextValue = {
    ...rootContextBase,
    openPath: openPathState(),
    getOpenPath: openPathState,
    setOpenPath,
    loop,
    portalEpoch: portalEpochState(),
    syncPortals: () => {
      portalEpochState.set(portalEpochState() + 1);
    },
    setCurrentTriggerIndex,
    resolvedState: rootState,
  };
  const portalIds = collectJsxElements(
    children,
    (element) => element.type === MenubarMenu
  ).map((_element, index) => resolvePartId(menubarId, `portal-${index}`));
  const collection = getCompositeCollection(menubarId);
  const nav = rovingFocus({
    currentIndex: rootState.currentTriggerIndex,
    itemCount: Math.max(rootState.items.length, 1),
    orientation: 'horizontal',
    loop,
    isDisabled: (index) => rootState.disabledTriggerIndexes.includes(index),
    onNavigate: (index) => {
      currentTriggerIndexState.set(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const finalProps = mergeProps(rest, {
    ...nav.container,
    ref,
    role: 'menubar',
    'data-slot': 'menubar',
    'data-menubar': 'true',
  });

  return (
    <MenubarRootContext.Scope value={rootContext}>
      <MenubarRootRenderContext.Scope value={runtimeRenderContext}>
        <div {...finalProps}>{children}</div>
        {portalIds.map((portalId) => {
          const PortalHost = getPersistentPortal(portalId);

          return <PortalHost key={`${portalId}-${rootContext.portalEpoch}`} />;
        })}
      </MenubarRootRenderContext.Scope>
    </MenubarRootContext.Scope>
  );
}
