import { state } from '@askrjs/askr';
import { mergeProps, rovingFocus } from '@askrjs/askr-ui/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { getCompositeCollection } from '../../_internal/composite';
import {
  collectJsxElements,
  isJsxElement,
  toChildArray,
} from '../../_internal/jsx';
import { getPersistentPortal } from '../../_internal/overlay';
import { MenubarMenu } from './menubar-menu';
import {
  createMenubarRootRenderContext,
  MenubarRootContext,
  MenubarRootRenderContext,
  readMenubarRootContext,
  resolveMenubarRootState,
  type MenubarRootContextValue,
} from './menubar.shared';
import type { MenubarProps } from './menubar.types';

function MenubarRuntimeView(props: {
  children?: unknown;
  ref: MenubarProps['ref'];
  rest: Omit<MenubarProps, 'children' | 'id' | 'loop'>;
}) {
  const root = readMenubarRootContext();
  const { items, currentTriggerIndex, disabledTriggerIndexes } =
    resolveMenubarRootState(root);
  const portalIds = collectJsxElements(
    props.children,
    (element) => element.type === MenubarMenu
  ).map((_element, index) => resolvePartId(root.menubarId, `portal-${index}`));

  portalIds.forEach((portalId) => {
    getPersistentPortal(portalId).render({ children: null });
  });

  const collection = getCompositeCollection(root.menubarId);
  const nav = rovingFocus({
    currentIndex: currentTriggerIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'horizontal',
    loop: root.loop,
    isDisabled: (index) => disabledTriggerIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentTriggerIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const finalProps = mergeProps(props.rest, {
    ...nav.container,
    ref: props.ref,
    role: 'menubar',
    'data-slot': 'menubar',
    'data-menubar': 'true',
  });

  return (
    <>
      <div {...finalProps}>
        {toChildArray(props.children).map((child, index) => {
          if (!isJsxElement(child) || child.key != null) {
            return child;
          }

          return {
            ...child,
            key: `menubar-root-${index}`,
          };
        })}
      </div>
      {portalIds.map((portalId) => {
        const PortalHost = getPersistentPortal(portalId);

        return <PortalHost key={portalId} />;
      })}
    </>
  );
}

export function Menubar(props: MenubarProps) {
  const { children, id, loop = true, ref, ...rest } = props;
  const menubarId = resolveCompoundId('menubar', id, children);
  const openPathState = state<string[]>([]);
  const portalEpochState = state(0);
  const currentTriggerIndexState = state(0);
  const rootContext: MenubarRootContextValue = {
    menubarId,
    openPath: openPathState(),
    setOpenPath: openPathState.set,
    loop,
    portalEpoch: portalEpochState(),
    syncPortals: () => {
      portalEpochState.set(portalEpochState() + 1);
    },
    currentTriggerIndexCandidate: currentTriggerIndexState(),
    setCurrentTriggerIndex: currentTriggerIndexState.set,
  };
  const runtimeRenderContext = createMenubarRootRenderContext();

  return (
    <MenubarRootContext.Scope value={rootContext}>
      <MenubarRootRenderContext.Scope value={runtimeRenderContext}>
        <MenubarRuntimeView ref={ref} rest={rest}>
          {children}
        </MenubarRuntimeView>
      </MenubarRootRenderContext.Scope>
    </MenubarRootContext.Scope>
  );
}
