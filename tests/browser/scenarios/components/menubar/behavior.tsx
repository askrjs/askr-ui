import { state } from '@askrjs/askr';
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../../../../../src/components/menubar';
import { getCompositeCollection } from '../../../../../src/components/_internal/composite';
import { flushUpdates, mount, spy } from '../../_mount';

export async function asChildChildRefs(root: HTMLElement) {
  const refs = {
    trigger: { current: null as HTMLElement | null },
    content: { current: null as HTMLElement | null },
    group: { current: null as HTMLElement | null },
    label: { current: null as HTMLElement | null },
    item: { current: null as HTMLElement | null },
    separator: { current: null as HTMLElement | null },
    subTrigger: { current: null as HTMLElement | null },
    subContent: { current: null as HTMLElement | null },
  };
  const callerRefs = {
    trigger: { current: null as HTMLElement | null },
    content: { current: null as HTMLElement | null },
    group: { current: null as HTMLElement | null },
    label: { current: null as HTMLElement | null },
    item: { current: null as HTMLElement | null },
    separator: { current: null as HTMLElement | null },
    subTrigger: { current: null as HTMLElement | null },
    subContent: { current: null as HTMLElement | null },
  };
  mount(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger
          asChild
          ref={(node) => (callerRefs.trigger.current = node)}
        >
          <button ref={refs.trigger}>File</button>
        </MenubarTrigger>
        <MenubarPortal>
          <MenubarContent
            asChild
            ref={(node) => (callerRefs.content.current = node)}
          >
            <section ref={refs.content}>
              <MenubarGroup
                asChild
                ref={(node) => (callerRefs.group.current = node)}
              >
                <div ref={refs.group}>
                  <MenubarLabel
                    asChild
                    ref={(node) => (callerRefs.label.current = node)}
                  >
                    <h3 ref={refs.label}>Actions</h3>
                  </MenubarLabel>
                  <MenubarItem
                    asChild
                    ref={(node) => (callerRefs.item.current = node)}
                  >
                    <a href="#open" ref={refs.item}>
                      Open
                    </a>
                  </MenubarItem>
                </div>
              </MenubarGroup>
              <MenubarSeparator
                asChild
                ref={(node) => (callerRefs.separator.current = node)}
              >
                <hr ref={refs.separator} />
              </MenubarSeparator>
              <MenubarSub value="share">
                <MenubarSubTrigger
                  asChild
                  ref={(node) => (callerRefs.subTrigger.current = node)}
                >
                  <button ref={refs.subTrigger}>Share</button>
                </MenubarSubTrigger>
                <MenubarPortal>
                  <MenubarSubContent
                    asChild
                    ref={(node) => (callerRefs.subContent.current = node)}
                  >
                    <aside ref={refs.subContent}>
                      <MenubarItem>Copy link</MenubarItem>
                    </aside>
                  </MenubarSubContent>
                </MenubarPortal>
              </MenubarSub>
            </section>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    root
  );
  await flushPortalUpdates();
  return {
    refsAttached: () =>
      Object.fromEntries(
        Object.entries(refs).map(([name, ref]) => [name, ref.current !== null])
      ),
    callerRefsAttached: () =>
      Object.fromEntries(
        Object.entries(callerRefs).map(([name, ref]) => [
          name,
          ref.current !== null,
        ])
      ),
  };
}

export function callerStateAriaOverrides(root: HTMLElement) {
  mount(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger aria-expanded="true" aria-haspopup="dialog">
          File
        </MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem disabled aria-disabled="false">
              Unavailable
            </MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    root
  );
  return {};
}

export function asChildDisabledHost(root: HTMLElement) {
  mount(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger asChild>
          <button disabled>File</button>
        </MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Open</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    root
  );
  return {
    hostDisabled: () => root.querySelector('button')?.disabled === true,
  };
}

export async function iframeTabTraversal(root: HTMLElement) {
  const iframe = document.createElement('iframe');
  root.appendChild(iframe);
  const ownerDocument = iframe.contentDocument;
  if (!ownerDocument) {
    throw new Error('Expected a same-origin iframe document');
  }

  const before = ownerDocument.createElement('button');
  before.textContent = 'Before';
  const menuRoot = ownerDocument.createElement('div');
  const after = ownerDocument.createElement('button');
  after.dataset.testid = 'after-menubar';
  after.textContent = 'After menubar';
  ownerDocument.body.replaceChildren(before, menuRoot, after);

  let tabBubbledToParent = false;
  mount(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Inside</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    menuRoot
  );
  menuRoot.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') tabBubbledToParent = true;
  });
  await flushPortalUpdates();
  menuRoot.querySelector('button')?.click();
  await flushPortalUpdates();

  return { tabWasStopped: () => !tabBubbledToParent };
}

export function customContentId(
  root: HTMLElement,
  options: { callerAria?: boolean } = {}
) {
  let contentId!: ReturnType<typeof state<string>>;
  function CustomMenubar() {
    contentId = state('caller-menubar-content');
    return (
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger
            aria-controls={
              options.callerAria ? 'caller-owned-controls' : undefined
            }
          >
            File
          </MenubarTrigger>
          <MenubarPortal>
            <MenubarContent id={() => contentId()}>
              <MenubarItem>One</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    );
  }
  mount(<CustomMenubar />, root);
  return {
    updateId: async () => {
      contentId.set('updated-menubar-content');
      await flushUpdates();
    },
  };
}

export function customTriggerId(
  root: HTMLElement,
  options: { callerAria?: boolean; submenu?: boolean } = {}
) {
  let triggerId!: ReturnType<typeof state<string>>;
  function CustomMenubar() {
    triggerId = state('caller-menu-trigger');
    return (
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger id={options.submenu ? undefined : () => triggerId()}>
            File
          </MenubarTrigger>
          <MenubarPortal>
            <MenubarContent
              aria-labelledby={
                !options.submenu && options.callerAria
                  ? 'caller-owned-label'
                  : undefined
              }
            >
              {options.submenu ? (
                <MenubarSub value="share">
                  <MenubarSubTrigger id={() => triggerId()}>
                    Share
                  </MenubarSubTrigger>
                  <MenubarPortal>
                    <MenubarSubContent
                      aria-labelledby={
                        options.callerAria ? 'caller-owned-label' : undefined
                      }
                    >
                      <MenubarItem>One</MenubarItem>
                    </MenubarSubContent>
                  </MenubarPortal>
                </MenubarSub>
              ) : (
                <MenubarItem>One</MenubarItem>
              )}
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    );
  }
  mount(<CustomMenubar />, root);
  return {
    updateId: async () => {
      triggerId.set('updated-menu-trigger');
      await flushUpdates();
    },
  };
}

export function ownKeyboardCaller(
  root: HTMLElement,
  options: { cancel?: boolean; target?: 'trigger' | 'item' | 'subtrigger' } = {}
) {
  let calls = 0;
  const onKeyDown = (event: KeyboardEvent) => {
    calls += 1;
    if (options.cancel) event.preventDefault();
  };
  mount(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger
          data-caller="preserved"
          onKeyDown={options.target === 'trigger' ? onKeyDown : undefined}
        >
          File
        </MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem
              data-caller="preserved"
              onKeyDown={options.target === 'item' ? onKeyDown : undefined}
            >
              One
            </MenubarItem>
            <MenubarSub value="share">
              <MenubarSubTrigger
                data-caller="preserved"
                onKeyDown={
                  options.target === 'subtrigger' ? onKeyDown : undefined
                }
              >
                Share
              </MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Email</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarItem>Two</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    root
  );
  return { calls: () => calls };
}

export function callerCancellation(
  root: HTMLElement,
  options: { content?: boolean } = {}
) {
  let calls = 0;
  const onKeyDown = (event: KeyboardEvent) => {
    calls += 1;
    event.preventDefault();
  };
  mount(
    <Menubar
      data-caller="preserved"
      onKeyDown={options.content ? undefined : onKeyDown}
    >
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent
            data-caller="preserved"
            onKeyDown={options.content ? onKeyDown : undefined}
          >
            <MenubarItem>One</MenubarItem>
            <MenubarItem>Two</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Cut</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    root
  );
  return { calls: () => calls };
}

async function flushPortalUpdates(): Promise<void> {
  await flushUpdates();
  await flushUpdates();
  await flushUpdates();
}

export function nestedSubmenus(root: HTMLElement): void {
  mount(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarSub value="share">
              <MenubarSubTrigger>Share</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Email</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Cut</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    root
  );
}

export function rtlSubmenu(root: HTMLElement): void {
  mount(
    <div dir="rtl">
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarSub value="share">
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Email</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    </div>,
    root
  );
}

export function keyboardOpen(root: HTMLElement): void {
  mount(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    root
  );
}

export function verticalArrows(root: HTMLElement): void {
  mount(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>One</MenubarItem>
            <MenubarItem disabled>Two</MenubarItem>
            <MenubarItem>Three</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    root
  );
}

export async function focusedTriggerDisabled(root: HTMLElement) {
  let disabled!: ReturnType<typeof state<boolean>>;
  function DynamicMenubar() {
    disabled = state(false);
    return (
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger disabled={disabled()}>File</MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    );
  }

  mount(<DynamicMenubar />, root);
  await flushPortalUpdates();
  return {
    disableFile: async () => {
      disabled.set(true);
      await flushPortalUpdates();
    },
  };
}

export async function typeaheadAndSubmenus(root: HTMLElement) {
  const onArchiveAction = spy();
  mount(
    <div>
      <Menubar>
        <MenubarMenu value="alpha">
          <MenubarTrigger>Alpha menu</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>Alpha action</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="database-1">
          <MenubarTrigger textValue="Database1" disabled>
            Disabled database menu
          </MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>Disabled action</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="database-2">
          <MenubarTrigger textValue="Database2">
            Primary database menu
          </MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>Alpha action</MenubarItem>
              <MenubarItem textValue="Database1" disabled>
                Disabled database action
              </MenubarItem>
              <MenubarItem textValue="Database2">
                Primary database action
              </MenubarItem>
              <MenubarItem
                textValue="Database Archive"
                onPress={onArchiveAction}
              >
                Archived database action
              </MenubarItem>
              <MenubarSub value="tools">
                <MenubarSubTrigger textValue="Tools">
                  Database tools
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Alpha child action</MenubarItem>
                  <MenubarItem textValue="Database1" disabled>
                    Disabled child action
                  </MenubarItem>
                  <MenubarItem textValue="Database2">
                    Primary child action
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="database-archive">
          <MenubarTrigger textValue="Database Archive">
            Archived database menu
          </MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>Archive report</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
      <button type="button" data-testid="after-menubar">
        After menubar
      </button>
    </div>,
    root
  );
  await flushPortalUpdates();

  return {
    archiveActionCount: () => onArchiveAction.count(),
    /** Items registered in the open content's composite collection. */
    openContentItemCount: () => {
      const openContent = document.body.querySelector<HTMLElement>(
        '[data-slot="menubar-content"]'
      );
      if (!openContent) throw new Error('no open menubar content');
      return getCompositeCollection(openContent.id).items().length;
    },
  };
}

export async function asChildTriggers(root: HTMLElement) {
  const onFilePress = spy();
  mount(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger asChild onPress={onFilePress}>
          <span>File</span>
        </MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarSub value="tools">
              <MenubarSubTrigger asChild>
                <span>Tools</span>
              </MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Inspect</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    root
  );
  await flushPortalUpdates();
  return { filePressCount: () => onFilePress.count() };
}

export function positionedContent(root: HTMLElement) {
  mount(
    <div>
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent side="bottom" align="start" sideOffset={8}>
              <MenubarItem>New</MenubarItem>
              <MenubarItem>Open recent</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
      <div style={{ height: '32px' }}>Following content</div>
    </div>,
    root
  );
  return { scrollHeight: () => document.body.scrollHeight };
}

export async function rtlTriggers(root: HTMLElement): Promise<void> {
  mount(
    <div dir="rtl">
      <Menubar loop={false}>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>Zoom</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    </div>,
    root
  );
  await flushPortalUpdates();
}

export function disabledKeyboardTriggers(root: HTMLElement): void {
  mount(
    <Menubar>
      <MenubarMenu value="disabled">
        <MenubarTrigger disabled asChild>
          <span>Disabled menu</span>
        </MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Disabled action</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
      <MenubarMenu value="enabled">
        <MenubarTrigger>Enabled menu</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Enabled action</MenubarItem>
            <MenubarSub value="disabled-sub">
              <MenubarSubTrigger disabled asChild>
                <span>Disabled submenu</span>
              </MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Disabled child action</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    root
  );
}

export function nestedItemFocus(root: HTMLElement): void {
  mount(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarSub value="share">
              <MenubarSubTrigger>Share</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Email</MenubarItem>
                <MenubarItem disabled>SMS</MenubarItem>
                <MenubarItem>Chat</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    root
  );
}
