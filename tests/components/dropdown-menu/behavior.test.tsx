import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '../../../src/components/composites/dropdown-menu';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('DropdownMenu - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('toggles trigger expansion state when activated', async () => {
    container = mount(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
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

  it('supports nested menu item composition without direct child injection', async () => {
    container = mount(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <div>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </div>
            <div>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    );

    await flushUpdates();

    const items = Array.from(document.body.querySelectorAll('[role="menuitem"]'));

    expect(items).toHaveLength(2);
    expect(items[0]?.getAttribute('tabindex')).toBe('0');
    expect(items[1]?.getAttribute('tabindex')).toBe('-1');
  });

  it('keeps menu open when all items are disabled and arrow navigation is attempted', async () => {
    container = mount(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Archive</DropdownMenuItem>
            <DropdownMenuItem disabled>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    );

    await flushUpdates();

    const content = document.body.querySelector(
      '[data-slot="dropdown-menu-content"]'
    ) as HTMLDivElement;
    content.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    await flushUpdates();

    const trigger = container.querySelector('[aria-haspopup="menu"]');
    const items = Array.from(document.body.querySelectorAll('[role="menuitem"]'));

    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.getAttribute('aria-disabled') === 'true')).toBe(
      true
    );
  });
});
