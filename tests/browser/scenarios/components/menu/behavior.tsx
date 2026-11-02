import { state } from '@askrjs/askr';
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuLabel,
  MenuSeparator,
} from '../../../../../src/components/menu';
import { flushUpdates, mount, spy } from '../../_mount';

export function asChildChildRefs(root: HTMLElement) {
  const refs = {
    content: { current: null as HTMLElement | null },
    group: { current: null as HTMLElement | null },
    label: { current: null as HTMLElement | null },
    item: { current: null as HTMLElement | null },
    icon: { current: null as HTMLElement | null },
    itemLabel: { current: null as HTMLElement | null },
    description: { current: null as HTMLElement | null },
    separator: { current: null as HTMLElement | null },
  };
  const container = mount(
    <Menu>
      <MenuContent asChild>
        <section ref={refs.content}>
          <MenuGroup asChild>
            <div ref={refs.group}>
              <MenuLabel asChild>
                <h3 ref={refs.label}>Actions</h3>
              </MenuLabel>
              <MenuItem asChild>
                <a href="#open" ref={refs.item}>
                  <MenuItemIcon asChild>
                    <i ref={refs.icon}>I</i>
                  </MenuItemIcon>
                  <MenuItemLabel asChild>
                    <b ref={refs.itemLabel}>Open</b>
                  </MenuItemLabel>
                  <MenuItemDescription asChild>
                    <small ref={refs.description}>Details</small>
                  </MenuItemDescription>
                </a>
              </MenuItem>
            </div>
          </MenuGroup>
          <MenuSeparator asChild>
            <hr ref={refs.separator} />
          </MenuSeparator>
        </section>
      </MenuContent>
    </Menu>,
    root
  );

  return {
    childRefs: () => ({
      content: refs.content.current === container.querySelector('section'),
      group:
        refs.group.current ===
        container.querySelector('div[data-slot="menu-group"]'),
      label: refs.label.current === container.querySelector('h3'),
      item:
        refs.item.current ===
        container.querySelector('a[data-slot="menu-item"]'),
      icon: refs.icon.current === container.querySelector('i'),
      itemLabel: refs.itemLabel.current === container.querySelector('b'),
      description:
        refs.description.current === container.querySelector('small'),
      separator: refs.separator.current === container.querySelector('hr'),
    }),
  };
}

export function callerStateAriaOverrides(root: HTMLElement): void {
  mount(
    <Menu orientation="horizontal">
      <MenuContent aria-orientation="vertical">
        <MenuItem aria-disabled="false" disabled>
          Disabled
        </MenuItem>
      </MenuContent>
    </Menu>,
    root
  );
}

export function asChildDisabledHost(root: HTMLElement) {
  const container = mount(
    <Menu>
      <MenuContent>
        <MenuItem asChild>
          <button data-testid="disabled-host" type="button" disabled>
            Disabled
          </button>
        </MenuItem>
      </MenuContent>
    </Menu>,
    root
  );

  return {
    hostDisabled: () =>
      (container.querySelector('button') as HTMLButtonElement | null)
        ?.disabled ?? false,
  };
}

export function iframeTabTraversal(root: HTMLElement) {
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
  after.dataset.testid = 'after-menu';
  after.textContent = 'After menu';
  ownerDocument.body.replaceChildren(before, menuRoot, after);

  let tabBubbledToParent = false;
  mount(
    <Menu>
      <MenuContent>
        <MenuItem>Inside</MenuItem>
      </MenuContent>
    </Menu>,
    menuRoot
  );
  menuRoot.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') tabBubbledToParent = true;
  });

  return { tabWasStopped: () => !tabBubbledToParent };
}

export function ownKeyboardCaller(
  root: HTMLElement,
  options: { cancel?: boolean } = {}
) {
  let calls = 0;
  mount(
    <Menu>
      <MenuContent>
        <MenuItem
          data-caller="preserved"
          onKeyDown={(event) => {
            calls += 1;
            if (options.cancel) event.preventDefault();
          }}
        >
          One
        </MenuItem>
        <MenuItem>Two</MenuItem>
      </MenuContent>
    </Menu>,
    root
  );
  return { calls: () => calls };
}

export function callerCancellation(root: HTMLElement) {
  let calls = 0;
  mount(
    <Menu>
      <MenuContent
        data-caller="preserved"
        onKeyDown={(event) => {
          calls += 1;
          event.preventDefault();
        }}
      >
        <MenuItem>One</MenuItem>
        <MenuItem>Two</MenuItem>
      </MenuContent>
    </Menu>,
    root
  );
  return { calls: () => calls };
}

export function singleTabStop(root: HTMLElement): void {
  mount(
    <Menu>
      <MenuContent>
        <MenuLabel>Actions</MenuLabel>
        <MenuItem>One</MenuItem>
        <MenuSeparator />
        <MenuItem>Two</MenuItem>
      </MenuContent>
    </Menu>,
    root
  );
}

export function navigationLinks(root: HTMLElement): void {
  mount(
    <Menu>
      <MenuContent aria-label="Workspaces">
        <MenuItem asChild textValue="Alpha workspace">
          <a href="#alpha">
            <MenuItemIcon aria-hidden="true">A</MenuItemIcon>
            <MenuItemLabel>Alpha</MenuItemLabel>
            <MenuItemDescription>Production workspace</MenuItemDescription>
          </a>
        </MenuItem>
        <MenuItem asChild textValue="Beta workspace">
          <a href="#beta">
            <MenuItemLabel>Beta</MenuItemLabel>
            <MenuItemDescription>Staging workspace</MenuItemDescription>
          </a>
        </MenuItem>
      </MenuContent>
    </Menu>,
    root
  );
}

export function nestedComposition(root: HTMLElement): void {
  mount(
    <Menu>
      <MenuContent>
        <div>
          <MenuItem>One</MenuItem>
        </div>
        <div>
          <MenuItem>Two</MenuItem>
        </div>
      </MenuContent>
    </Menu>,
    root
  );
}

export function typeaheadAndActivation(root: HTMLElement) {
  const onArchiveSelect = spy();
  mount(
    <div>
      <Menu>
        <MenuContent>
          <MenuItem>Alpha</MenuItem>
          <MenuItem textValue="Database1" disabled>
            Disabled database
          </MenuItem>
          <MenuItem textValue="Database2">Primary database</MenuItem>
          <MenuItem
            asChild
            textValue="Database Archive"
            onSelect={onArchiveSelect}
          >
            <span>Archived database</span>
          </MenuItem>
        </MenuContent>
      </Menu>
      <button type="button" data-testid="after-menu">
        After menu
      </button>
    </div>,
    root
  );
  return { archiveSelectCount: () => onArchiveSelect.count() };
}

export async function verticalArrows(root: HTMLElement): Promise<void> {
  mount(
    <Menu loop={false}>
      <MenuContent>
        <MenuItem>One</MenuItem>
        <MenuItem disabled>Two</MenuItem>
        <MenuItem>Three</MenuItem>
      </MenuContent>
    </Menu>,
    root
  );
  await flushUpdates();
  await flushUpdates();
}

export async function focusedItemDisabled(root: HTMLElement) {
  let disabled!: ReturnType<typeof state<boolean>>;
  function DynamicMenu() {
    disabled = state(false);
    return (
      <Menu>
        <MenuContent>
          <MenuItem>One</MenuItem>
          <MenuItem disabled={disabled()}>Two</MenuItem>
          <MenuItem>Three</MenuItem>
        </MenuContent>
      </Menu>
    );
  }

  mount(<DynamicMenu />, root);
  await flushUpdates();
  await flushUpdates();
  return {
    disableTwo: async () => {
      disabled.set(true);
      await flushUpdates();
      await flushUpdates();
    },
  };
}

export async function rtlHorizontal(root: HTMLElement): Promise<void> {
  mount(
    <div dir="rtl">
      <Menu orientation="horizontal" loop={false}>
        <MenuContent>
          <MenuItem>One</MenuItem>
          <MenuItem>Two</MenuItem>
          <MenuItem>Three</MenuItem>
        </MenuContent>
      </Menu>
    </div>,
    root
  );
  await flushUpdates();
}
