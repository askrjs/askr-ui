import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { flush, mount, type RenderResult } from '@askrjs/askr/testing';
import { Dialog, DialogContent } from '../../../../src/components/dialog';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '../../../../src/components/dropdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../../../../src/components/select';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '../../../../src/components/menubar';

const views: RenderResult[] = [];
async function settle() {
  for (let index = 0; index < 6; index += 1) {
    await Promise.resolve();
    flush();
  }
}
afterEach(async () => {
  for (const view of views.splice(0)) view.unmount();
  await settle();
  vi.restoreAllMocks();
});

const families: Array<[string, () => unknown, string]> = [
  [
    'dropdown',
    () => (
      <Dropdown>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent forceMount>
          <DropdownItem>Item</DropdownItem>
        </DropdownContent>
      </Dropdown>
    ),
    '[data-slot="dropdown-content"]',
  ],
  [
    'select',
    () => (
      <Select>
        <SelectTrigger>Pick</SelectTrigger>
        <SelectContent forceMount>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    ),
    '[data-slot="select-content"]',
  ],
  [
    'menubar',
    () => (
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent forceMount>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ),
    '[data-slot="menubar-content"]',
  ],
];

describe('closed force-mounted menus', () => {
  it.each(families)(
    'should not intercept Escape meant for an open dialog or take focus (%s)',
    async (_name, menu, contentSelector) => {
      const close = vi.fn();
      const view = mount(() => (
        <>
          <Dialog open onOpenChange={close}>
            <DialogContent>Dialog body</DialogContent>
          </Dialog>
          {menu()}
        </>
      ));
      views.push(view);
      await settle();
      const content = document.querySelector(contentSelector);
      expect(content).not.toBeNull();
      expect(content!.contains(document.activeElement)).toBe(false);
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        })
      );
      await settle();
      expect(close).toHaveBeenCalledWith(false);
    }
  );
});
