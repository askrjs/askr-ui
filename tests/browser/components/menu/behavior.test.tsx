import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from '../../../../src/components/menu';
import { mount, unmount } from '../../test-utils';

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
});
