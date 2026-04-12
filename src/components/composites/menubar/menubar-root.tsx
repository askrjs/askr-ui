import { state } from '@askrjs/askr';
import { mergeProps, rovingFocus } from '@askrjs/askr/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { resolveCompoundId } from '../../_internal/id';
import {
  getCompositeCollection,
} from '../../_internal/composite';
import { getPersistentPortal } from '../../_internal/overlay';
import {
  beginMenubarTriggerDeclaration,
  createMenubarRootRenderContext,
  MenubarDeclarationContext,
  MenubarRootContext,
  MenubarRootRenderContext,
  readMenubarRootContext,
  resolveMenubarRootState,
  type MenubarRootContextValue,
} from './menubar.shared';
import type { MenubarProps } from './menubar.types';

function MenubarDeclarationPassView(props: {
  children?: unknown;
  menubarId: string;
}) {
  beginMenubarTriggerDeclaration(props.menubarId);
  return <>{props.children}</>;
}

function MenubarDeclarationContextView(props: {
  children?: unknown;
  menubarId: string;
  renderContext: ReturnType<typeof createMenubarRootRenderContext>;
}) {
  return (
    <MenubarRootRenderContext.Scope value={props.renderContext}>
      <MenubarDeclarationPassView menubarId={props.menubarId}>
        {props.children}
      </MenubarDeclarationPassView>
    </MenubarRootRenderContext.Scope>
  );
}

function MenubarRuntimeView(props: {
  children?: unknown;
  ref: MenubarProps['ref'];
  rest: Omit<MenubarProps, 'children' | 'id' | 'loop'>;
}) {
  const root = readMenubarRootContext();
  const { items, currentTriggerIndex, disabledTriggerIndexes } =
    resolveMenubarRootState(root);

  items.forEach((item) => {
    getPersistentPortal(item.portalId).render({ children: null });
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
      <div {...finalProps}>{props.children}</div>
      {items.map((item) => {
        const PortalHost = getPersistentPortal(item.portalId);

        return <PortalHost key={item.portalId} />;
      })}
    </>
  );
}

function MenubarScopeView(props: {
  children?: unknown;
  menubarId: string;
  ref: MenubarProps['ref'];
  rest: Omit<MenubarProps, 'children' | 'id' | 'loop'>;
  declarationRenderContext: ReturnType<typeof createMenubarRootRenderContext>;
  runtimeRenderContext: ReturnType<typeof createMenubarRootRenderContext>;
}) {
  return (
    <>
      <MenubarDeclarationContext.Scope value={true}>
        <MenubarDeclarationContextView
          menubarId={props.menubarId}
          renderContext={props.declarationRenderContext}
        >
          {props.children}
        </MenubarDeclarationContextView>
      </MenubarDeclarationContext.Scope>
      <MenubarRootRenderContext.Scope value={props.runtimeRenderContext}>
        <MenubarRuntimeView ref={props.ref} rest={props.rest}>
          {props.children}
        </MenubarRuntimeView>
      </MenubarRootRenderContext.Scope>
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
  const declarationRenderContext = createMenubarRootRenderContext();
  const runtimeRenderContext = createMenubarRootRenderContext();

  return (
    <MenubarRootContext.Scope value={rootContext}>
      <MenubarScopeView
        children={children}
        menubarId={menubarId}
        ref={ref}
        rest={rest}
        declarationRenderContext={declarationRenderContext}
        runtimeRenderContext={runtimeRenderContext}
      />
    </MenubarRootContext.Scope>
  );
}