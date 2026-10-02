import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from '../../../../../src/components/menubar';
import { flushUpdates, mount } from '../../_mount';

const contentSelector = '[data-slot="menubar-content"]';

export async function nonTabKeyDoesNotQueryAllMenubars(root: HTMLElement) {
  const container = mount(
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

  const trigger = container.querySelector('button') as HTMLButtonElement;
  trigger.click();
  await flushUpdates();

  const content = document.body.querySelector(contentSelector);
  if (!(content instanceof HTMLElement)) {
    throw new Error('Expected Menubar content to be open');
  }

  return {
    dispatchKey(key: string) {
      let count = 0;
      const originalQuerySelectorAll = document.querySelectorAll;
      document.querySelectorAll = ((selector: string) => {
        if (selector === contentSelector) count += 1;
        return originalQuerySelectorAll.call(document, selector);
      }) as typeof document.querySelectorAll;

      try {
        content.dispatchEvent(
          new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            cancelable: true,
          })
        );
      } finally {
        document.querySelectorAll = originalQuerySelectorAll;
      }

      return count;
    },
  };
}
