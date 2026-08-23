import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
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
} from '../../../../src/components/menu';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Menu - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('should render menu semantics with a single tab stop', () => {
    container = mount(
      <Menu>
        <MenuContent>
          <MenuLabel>Actions</MenuLabel>
          <MenuItem>One</MenuItem>
          <MenuSeparator />
          <MenuItem>Two</MenuItem>
        </MenuContent>
      </Menu>
    );

    const items = container.querySelectorAll('[role="menuitem"]');

    expect(items[0].getAttribute('tabindex')).toBe('0');
    expect(items[1].getAttribute('tabindex')).toBe('-1');
  });

  it('should support standalone navigation links with structured item content', async () => {
    container = mount(
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
      </Menu>
    );

    const links = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a')
    );
    links[0]!.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(links[1]);
    await userEvent.keyboard('a');
    expect(document.activeElement).toBe(links[0]);
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(links[1]);
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(links[0]);
    expect(
      links[0]!.querySelector('[data-slot="menu-item-description"]')
        ?.textContent
    ).toBe('Production workspace');
  });

  it('should support nested menu item composition without direct child injection', () => {
    container = mount(
      <Menu>
        <MenuContent>
          <div>
            <MenuItem>One</MenuItem>
          </div>
          <div>
            <MenuItem>Two</MenuItem>
          </div>
        </MenuContent>
      </Menu>
    );

    const items = container.querySelectorAll('[role="menuitem"]');

    expect(items[0].getAttribute('tabindex')).toBe('0');
    expect(items[1].getAttribute('tabindex')).toBe('-1');
  });

  it('should support typeahead, activation keys, and a single Tab stop', async () => {
    const onArchiveSelect = vi.fn();
    container = mount(
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
      </div>
    );

    const alpha = Array.from(
      container.querySelectorAll<HTMLElement>('[role="menuitem"]')
    ).find((item) => item.textContent?.trim() === 'Alpha')!;
    alpha.focus();

    await userEvent.keyboard('D');
    expect(document.activeElement?.textContent?.trim()).toBe(
      'Primary database'
    );

    await userEvent.keyboard('d');
    expect(document.activeElement?.textContent?.trim()).toBe(
      'Archived database'
    );

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onArchiveSelect).toHaveBeenCalledTimes(2);

    await userEvent.tab();
    expect(document.activeElement).toBe(
      container.querySelector('[data-testid="after-menu"]')
    );
  });

  it('should move actual focus with vertical arrow keys', async () => {
    container = mount(
      <Menu loop={false}>
        <MenuContent>
          <MenuItem>One</MenuItem>
          <MenuItem disabled>Two</MenuItem>
          <MenuItem>Three</MenuItem>
        </MenuContent>
      </Menu>
    );
    await flushUpdates();
    await flushUpdates();

    const items = Array.from(
      container.querySelectorAll<HTMLElement>('[role="menuitem"]')
    );
    items[0]!.focus();
    await userEvent.keyboard('{ArrowDown}');
    await flushUpdates();

    expect(document.activeElement).toBe(items[2]);
    expect(items[2]!.getAttribute('tabindex')).toBe('0');
    expect(items[2]!.getAttribute('data-roving-index')).toBe('2');

    await userEvent.keyboard('{ArrowUp}');
    await flushUpdates();
    expect(document.activeElement).toBe(items[0]);
  });

  it('should move focus when the focused item becomes disabled', async () => {
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

    container = mount(<DynamicMenu />);
    await flushUpdates();
    await flushUpdates();
    const two = Array.from(
      container.querySelectorAll<HTMLElement>('[role="menuitem"]')
    ).find((item) => item.textContent === 'Two')!;
    two.focus();

    disabled.set(true);
    await flushUpdates();
    await flushUpdates();

    expect(document.activeElement?.textContent).toBe('Three');
  });
});
