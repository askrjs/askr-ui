import { afterEach, describe, expect, it } from 'vite-plus/test';
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
});
