import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownPortal,
  DropdownTrigger,
} from '../../../../src/components/dropdown';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Dropdown - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('should toggles trigger expansion state when activated', async () => {
    container = mount(
      <Dropdown>
        <DropdownTrigger>Open dropdown</DropdownTrigger>
        <DropdownPortal>
          <DropdownContent>
            <DropdownItem>Archive</DropdownItem>
          </DropdownContent>
        </DropdownPortal>
      </Dropdown>
    );

    let trigger = container.querySelector(
      '[aria-haspopup="menu"]'
    ) as HTMLButtonElement;
    trigger.click();
    await flushUpdates();
    trigger = container.querySelector(
      '[aria-haspopup="menu"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    trigger.click();
    await flushUpdates();
    trigger = container.querySelector(
      '[aria-haspopup="menu"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('should renders typed trigger and item variants for themed menus', async () => {
    container = mount(
      <Dropdown defaultOpen>
        <DropdownTrigger variant="ghost" size="icon" aria-label="Open menu">
          Menu
        </DropdownTrigger>
        <DropdownPortal>
          <DropdownContent>
            <DropdownItem variant="destructive" asChild>
              <a href="/logout">Sign out</a>
            </DropdownItem>
          </DropdownContent>
        </DropdownPortal>
      </Dropdown>
    );

    await flushUpdates();

    const trigger = container.querySelector(
      '[aria-haspopup="menu"]'
    ) as HTMLButtonElement;
    const item = document.body.querySelector(
      '[role="menuitem"]'
    ) as HTMLElement;

    expect(trigger.getAttribute('data-variant')).toBe('ghost');
    expect(trigger.getAttribute('data-size')).toBe('icon');
    expect(item.tagName).toBe('A');
    expect(item.getAttribute('data-slot')).toBe('dropdown-item');
    expect(item.getAttribute('data-variant')).toBe('destructive');
  });

  it('should supports nested dropdown item composition without direct child injection', async () => {
    container = mount(
      <Dropdown defaultOpen>
        <DropdownTrigger>Open dropdown</DropdownTrigger>
        <DropdownPortal>
          <DropdownContent>
            <div>
              <DropdownItem>Archive</DropdownItem>
            </div>
            <div>
              <DropdownItem>Delete</DropdownItem>
            </div>
          </DropdownContent>
        </DropdownPortal>
      </Dropdown>
    );

    await flushUpdates();
    await flushUpdates();

    const items = Array.from(
      document.body.querySelectorAll('[role="menuitem"]')
    );

    expect(items).toHaveLength(2);
    expect(items[0]?.getAttribute('tabindex')).toBe('0');
    expect(items[1]?.getAttribute('tabindex')).toBe('-1');
  });

  it('should keeps dropdown open when all items are disabled and arrow navigation is attempted', async () => {
    container = mount(
      <Dropdown defaultOpen>
        <DropdownTrigger>Open dropdown</DropdownTrigger>
        <DropdownPortal>
          <DropdownContent>
            <DropdownItem disabled>Archive</DropdownItem>
            <DropdownItem disabled>Delete</DropdownItem>
          </DropdownContent>
        </DropdownPortal>
      </Dropdown>
    );

    await flushUpdates();
    await flushUpdates();

    const content = document.body.querySelector(
      '[data-slot="dropdown-content"]'
    ) as HTMLDivElement;
    content.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    await flushUpdates();

    const trigger = container.querySelector('[aria-haspopup="menu"]');
    const items = Array.from(
      document.body.querySelectorAll('[role="menuitem"]')
    );

    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.getAttribute('tabindex') === '-1')).toBe(
      true
    );
    expect(
      items.every((item) => item.getAttribute('aria-disabled') === 'true')
    ).toBe(true);
  });

  it('should supports menu-button opening, typeahead, activation, and Tab dismissal', async () => {
    const onArchiveSelect = vi.fn();
    container = mount(
      <div>
        <Dropdown>
          <DropdownTrigger>Open database menu</DropdownTrigger>
          <DropdownPortal>
            <DropdownContent>
              <DropdownItem>Alpha</DropdownItem>
              <DropdownItem textValue="Database1" disabled>
                Disabled database
              </DropdownItem>
              <DropdownItem textValue="Database2">
                Primary database
              </DropdownItem>
              <DropdownItem
                asChild
                textValue="Database Archive"
                onSelect={onArchiveSelect}
              >
                <span>Archived database</span>
              </DropdownItem>
            </DropdownContent>
          </DropdownPortal>
        </Dropdown>
        <button type="button" data-testid="after-dropdown">
          After dropdown
        </button>
      </div>
    );

    let trigger = container.querySelector(
      '[data-slot="dropdown-trigger"]'
    ) as HTMLButtonElement;
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await flushUpdates();
    await flushUpdates();

    trigger = container.querySelector(
      '[data-slot="dropdown-trigger"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.textContent?.trim()).toBe('Alpha');

    await userEvent.keyboard('D');
    expect(document.activeElement?.textContent?.trim()).toBe(
      'Primary database'
    );

    await userEvent.keyboard('d');
    expect(document.activeElement?.textContent?.trim()).toBe(
      'Archived database'
    );

    await userEvent.keyboard('{Enter}');
    await flushUpdates();
    expect(onArchiveSelect).toHaveBeenCalledTimes(1);

    trigger = container.querySelector(
      '[data-slot="dropdown-trigger"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.focus();
    await userEvent.keyboard(' ');
    await flushUpdates();
    await flushUpdates();
    trigger = container.querySelector(
      '[data-slot="dropdown-trigger"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    await userEvent.tab();
    await flushUpdates();
    await flushUpdates();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(
      container.querySelector('[data-testid="after-dropdown"]')
    );
  });

  it('should activates an asChild item with Space', async () => {
    const onSelect = vi.fn();
    container = mount(
      <Dropdown defaultOpen>
        <DropdownTrigger>Open</DropdownTrigger>
        <DropdownPortal>
          <DropdownContent>
            <DropdownItem asChild onSelect={onSelect}>
              <span>Archive</span>
            </DropdownItem>
          </DropdownContent>
        </DropdownPortal>
      </Dropdown>
    );
    await flushUpdates();
    await flushUpdates();

    const item = document.body.querySelector(
      '[data-slot="dropdown-item"]'
    ) as HTMLElement;
    item.focus();
    await userEvent.keyboard(' ');
    await flushUpdates();

    expect(onSelect).toHaveBeenCalledTimes(1);
    const trigger = container.querySelector(
      '[data-slot="dropdown-trigger"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('should throw when DropdownContent is used without Dropdown', () => {
    expect(() => {
      mount(
        <DropdownPortal>
          <DropdownContent>
            <DropdownItem>Orphan</DropdownItem>
          </DropdownContent>
        </DropdownPortal>
      );
    }).toThrow('Dropdown components must be used within <Dropdown>');
  });

  it('should allow DropdownItem when used within Dropdown', () => {
    mount(
      <Dropdown defaultOpen>
        <DropdownTrigger>Open</DropdownTrigger>
        <DropdownPortal>
          <DropdownItem>Orphan</DropdownItem>
        </DropdownPortal>
      </Dropdown>
    );

    const item = document.body.querySelector('[role="menuitem"]');

    expect(item?.textContent).toBe('Orphan');
  });

  it('should throw when DropdownTrigger is used without Dropdown', () => {
    expect(() => {
      mount(<DropdownTrigger>Orphan</DropdownTrigger>);
    }).toThrow('Dropdown components must be used within <Dropdown>');
  });
});
