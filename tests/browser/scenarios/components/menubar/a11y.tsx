import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from '../../../../../src/components/menubar';
import { flushUpdates, mount } from '../../_mount';

export function axeOpenMenubar(root: HTMLElement) {
  mount(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
    root
  );

  return {
    openFileMenu: async () => {
      (
        Array.from(document.body.querySelectorAll('button')).find(
          (element) => element.textContent?.trim() === 'File'
        ) as HTMLButtonElement
      ).click();
      await flushUpdates();
      await flushUpdates();
    },
  };
}
