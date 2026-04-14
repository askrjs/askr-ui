import { describe, it } from 'vite-plus/test';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from '../../../src/components/composites/menubar';
import { axe } from 'vitest-axe';
import { expectNoAxeViolations } from '../../accessibility';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Menubar - Accessibility', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should have no automated axe violations given open menubar content', async () => {
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

    (
      Array.from(document.body.querySelectorAll('button')).find(
        (element) => element.textContent?.trim() === 'File'
      ) as HTMLButtonElement
    ).click();
    await flushUpdates();
    await flushUpdates();

    const results = await axe(container);

    expect(results.violations).toEqual([]);
  });
});
