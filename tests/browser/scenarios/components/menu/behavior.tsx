import { state } from '@askrjs/askr';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuLabel,
  MenuSeparator,
} from '../../../../../src/components/menu';
import { flushUpdates, mount, spy } from '../../_mount';

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
