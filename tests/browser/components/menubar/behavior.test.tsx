import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../../../../src/components/menubar';
import { MENUBAR_A11Y_CONTRACT } from '../../../../src/components/menubar/menubar.a11y';
import { getCompositeCollection } from '../../../../src/components/_internal/composite';
import { flushUpdates, mount, unmount } from '../../test-utils';

function getButtonByText(text: string): HTMLButtonElement {
  const button = Array.from(document.body.querySelectorAll('button')).find(
    (element) => element.textContent?.trim() === text
  );

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Unable to find button with text "${text}"`);
  }

  return button;
}

async function flushPortalUpdates() {
  await flushUpdates();
  await flushUpdates();
  await flushUpdates();
}

async function flushOverlayPosition() {
  await flushPortalUpdates();
  for (let frame = 0; frame < 10; frame++) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
}

describe('Menubar - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('should opens top-level triggers and nested submenus', async () => {
    container = mount(
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
      </Menubar>
    );

    getButtonByText('File').click();
    await flushPortalUpdates();

    expect(document.body.textContent).toContain('New');

    getButtonByText('Share').click();
    await flushPortalUpdates();

    expect(getButtonByText('File').getAttribute('aria-expanded')).toBe('true');
    expect(document.body.textContent).toContain('Email');
  });

  it('should supports keyboard opening and escape dismissal', async () => {
    container = mount(
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    );

    const fileTrigger = getButtonByText('File');
    fileTrigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    await flushPortalUpdates();
    expect(document.body.textContent).toContain('New');

    (
      document.body.querySelector(
        `[role="${MENUBAR_A11Y_CONTRACT.CONTENT_ROLE}"]`
      ) as HTMLDivElement
    ).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    await flushPortalUpdates();
    expect(document.body.textContent).not.toContain('New');
  });

  it('should supports typeahead, activation keys, submenus, and Tab dismissal', async () => {
    const onArchiveAction = vi.fn();
    container = mount(
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
      </div>
    );
    await flushPortalUpdates();

    getButtonByText('Alpha menu').focus();

    await userEvent.keyboard('D');
    await flushUpdates();
    expect(document.activeElement?.textContent?.trim()).toBe(
      'Primary database menu'
    );

    await userEvent.keyboard('d');
    await flushUpdates();
    expect(document.activeElement?.textContent?.trim()).toBe(
      'Archived database menu'
    );

    await userEvent.keyboard('D');
    await flushUpdates();
    expect(document.activeElement?.textContent?.trim()).toBe(
      'Primary database menu'
    );

    await userEvent.keyboard('{Enter}');
    await flushPortalUpdates();
    expect(
      document.body.querySelectorAll('[data-slot="menubar-content"]')
    ).toHaveLength(1);
    const openContent = document.body.querySelector<HTMLElement>(
      '[data-slot="menubar-content"]'
    )!;
    expect(getCompositeCollection(openContent.id).items()).toHaveLength(5);
    expect(document.activeElement?.textContent?.trim()).toBe('Alpha action');

    await userEvent.keyboard('d');
    expect(document.activeElement?.textContent?.trim()).toBe(
      'Primary database action'
    );

    await userEvent.keyboard('D');
    expect(document.activeElement?.textContent?.trim()).toBe(
      'Archived database action'
    );

    await userEvent.keyboard('{Enter}');
    await flushPortalUpdates();
    expect(onArchiveAction).toHaveBeenCalledTimes(1);

    const primaryTrigger = getButtonByText('Primary database menu');
    primaryTrigger.focus();
    await userEvent.keyboard(' ');
    await flushPortalUpdates();

    await userEvent.keyboard('t');
    expect(document.activeElement?.textContent?.trim()).toBe('Database tools');

    await userEvent.keyboard('{Enter}');
    await flushPortalUpdates();
    expect(document.activeElement?.textContent?.trim()).toBe(
      'Alpha child action'
    );

    await userEvent.keyboard('d');
    expect(document.activeElement?.textContent?.trim()).toBe(
      'Primary child action'
    );

    await userEvent.tab();
    await flushPortalUpdates();

    expect(
      getButtonByText('Primary database menu').getAttribute('aria-expanded')
    ).toBe('false');
    expect(document.activeElement).toBe(
      container.querySelector('[data-testid="after-menubar"]')
    );
  });

  it('should preserves Enter activation for asChild menu and submenu triggers', async () => {
    const onFilePress = vi.fn();
    container = mount(
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
      </Menubar>
    );
    await flushPortalUpdates();

    const file = container.querySelector(
      '[data-slot="menubar-trigger"]'
    ) as HTMLElement;
    file.focus();
    expect(document.activeElement).toBe(file);
    await userEvent.keyboard('{Enter}');
    await flushPortalUpdates();

    expect(onFilePress).toHaveBeenCalledTimes(1);
    expect(
      container
        .querySelector('[data-slot="menubar-trigger"]')
        ?.getAttribute('aria-expanded')
    ).toBe('true');

    const tools = document.body.querySelector(
      '[data-slot="menubar-sub-trigger"]'
    ) as HTMLElement;
    expect(tools).not.toBeNull();

    tools.focus();
    await userEvent.keyboard('{Enter}');
    await flushPortalUpdates();

    expect(document.body.textContent).toContain('Inspect');
  });

  it('should position open content without shifting document flow', async () => {
    container = mount(
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
      </div>
    );

    const beforeHeight = document.body.scrollHeight;
    const fileTrigger = getButtonByText('File');

    fileTrigger.click();
    await flushOverlayPosition();

    const content = document.body.querySelector(
      '[data-slot="menubar-content"]'
    ) as HTMLElement | null;

    const triggerId = fileTrigger.id;
    expect(content).not.toBeNull();
    expect(content?.getAttribute('data-slot')).toBe('menubar-content');
    expect(content?.getAttribute('aria-labelledby')).toBe(triggerId);
    expect(content?.id).toBeTruthy();
    expect(getComputedStyle(content!).position).toBe('fixed');
    expect(document.body.scrollHeight).toBe(beforeHeight);

    (content as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    await flushPortalUpdates();
    expect(
      document.body.querySelector('[data-slot="menubar-content"]')
    ).toBeNull();

    expect(fileTrigger.getAttribute('aria-expanded')).toBe('false');
  });
});
