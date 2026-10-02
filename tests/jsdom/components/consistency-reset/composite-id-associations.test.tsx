import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { flush, mount, type RenderResult } from '@askrjs/askr/testing';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownPortal,
  DropdownTrigger,
} from '../../../../src/components/dropdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '../../../../src/components/select';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from '../../../../src/components/menubar';

const views: RenderResult[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const view of views.splice(0)) view.unmount();
});
async function settle() {
  for (let index = 0; index < 4; index += 1) {
    await Promise.resolve();
    flush();
  }
}

describe('Composite committed ID associations', () => {
  for (const family of ['dropdown', 'select', 'menubar'] as const) {
    it(`should preserve ${family} explicit null caller ARIA omission`, async () => {
      const view = mount(() => {
        if (family === 'dropdown')
          return (
            <Dropdown defaultOpen>
              <DropdownTrigger aria-controls={null}>Open</DropdownTrigger>
              <DropdownPortal>
                <DropdownContent id="caller-content">
                  <DropdownItem>One</DropdownItem>
                </DropdownContent>
              </DropdownPortal>
            </Dropdown>
          );
        if (family === 'select')
          return (
            <Select defaultOpen>
              <SelectTrigger aria-controls={null}>Open</SelectTrigger>
              <SelectPortal>
                <SelectContent id="caller-content">
                  <SelectItem value="one">One</SelectItem>
                </SelectContent>
              </SelectPortal>
            </Select>
          );
        return (
          <Menubar>
            <MenubarMenu value="file">
              <MenubarTrigger aria-controls={null}>Open</MenubarTrigger>
              <MenubarPortal>
                <MenubarContent id="caller-content" aria-labelledby={null}>
                  <MenubarItem>One</MenubarItem>
                </MenubarContent>
              </MenubarPortal>
            </MenubarMenu>
          </Menubar>
        );
      });
      views.push(view);
      if (family === 'menubar')
        (
          view.container.querySelector(
            '[data-slot="menubar-trigger"]'
          ) as HTMLElement
        ).click();
      await settle();
      const trigger = view.container.querySelector(
        `[data-slot="${family}-trigger"]`
      )!;
      expect(trigger.hasAttribute('aria-controls')).toBe(false);
      if (family === 'menubar')
        expect(
          document
            .querySelector('[data-slot="menubar-content"]')!
            .hasAttribute('aria-labelledby')
        ).toBe(false);
    });

    for (const failurePart of ['trigger', 'content'] as const) {
      it(`should retain ${family} committed IDs and caller association policy after a rejected ${failurePart} update`, async () => {
        let changed!: ReturnType<typeof state<boolean>>;
        const view = mount(() => {
          changed = state(false);
          const contentId =
            failurePart === 'content' && changed()
              ? 'updated-content'
              : 'committed-content';
          const controls =
            failurePart === 'trigger' && changed()
              ? 'caller-owned-controls'
              : undefined;
          const children = (
            <span data-testid="association-host">
              {changed() ? <span>New child</span> : null}
            </span>
          );
          const triggerChildren = (
            <>Open{failurePart === 'trigger' ? children : null}</>
          );
          const contentChildren = failurePart === 'content' ? children : null;
          if (family === 'dropdown')
            return (
              <Dropdown defaultOpen>
                <DropdownTrigger aria-controls={controls}>
                  {triggerChildren}
                </DropdownTrigger>
                <DropdownPortal>
                  <DropdownContent id={contentId}>
                    {contentChildren}
                    <DropdownItem>One</DropdownItem>
                  </DropdownContent>
                </DropdownPortal>
              </Dropdown>
            );
          if (family === 'select')
            return (
              <Select defaultOpen>
                <SelectTrigger aria-controls={controls}>
                  {triggerChildren}
                </SelectTrigger>
                <SelectPortal>
                  <SelectContent id={contentId}>
                    {contentChildren}
                    <SelectItem value="one">One</SelectItem>
                  </SelectContent>
                </SelectPortal>
              </Select>
            );
          return (
            <Menubar>
              <MenubarMenu value="file">
                <MenubarTrigger aria-controls={controls}>
                  {triggerChildren}
                </MenubarTrigger>
                <MenubarPortal>
                  <MenubarContent id={contentId}>
                    {contentChildren}
                    <MenubarItem>One</MenubarItem>
                  </MenubarContent>
                </MenubarPortal>
              </MenubarMenu>
            </Menubar>
          );
        });
        views.push(view);
        if (family === 'menubar') {
          (
            view.container.querySelector(
              '[data-slot="menubar-trigger"]'
            ) as HTMLElement
          ).click();
        }
        await settle();
        const trigger = view.container.querySelector(
          `[data-slot="${family}-trigger"]`
        )!;
        const content = document.querySelector(
          `[data-slot="${family}-content"]`
        )!;
        const host = (
          failurePart === 'trigger' ? trigger : content
        ).querySelector('[data-testid="association-host"]')!;
        expect(trigger.getAttribute('aria-controls')).toBe('committed-content');
        const failure = new Error(
          'forced association structural commit failure'
        );
        const insertion = vi
          .spyOn(host, 'insertBefore')
          .mockImplementation(() => {
            throw failure;
          });
        changed.set(true);
        expect(() => flush()).toThrow(failure);
        insertion.mockRestore();
        await Promise.resolve();
        expect(content.id).toBe('committed-content');
        expect(trigger.getAttribute('aria-controls')).toBe('committed-content');
        changed.set(false);
        await settle();
        changed.set(true);
        await settle();
        expect(content.id).toBe(
          failurePart === 'content' ? 'updated-content' : 'committed-content'
        );
        expect(trigger.getAttribute('aria-controls')).toBe(
          failurePart === 'trigger'
            ? 'caller-owned-controls'
            : 'updated-content'
        );
      });
    }
  }
});
