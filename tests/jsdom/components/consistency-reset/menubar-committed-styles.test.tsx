import { afterEach, expect, it, vi } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { flush, mount, type RenderResult } from '@askrjs/askr/testing';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from '../../../../src/components/menubar';

let view: RenderResult | undefined;
afterEach(() => {
  vi.restoreAllMocks();
  view?.unmount();
  view = undefined;
  document.head
    .querySelectorAll('[data-askr-dynamic-styles]')
    .forEach((node) => node.remove());
});

it('should publish menubar structural styles only after a successful commit', () => {
  document.head
    .querySelectorAll('[data-askr-dynamic-styles]')
    .forEach((node) => node.remove());
  let visible!: ReturnType<typeof state<boolean>>;
  view = mount(() => {
    visible = state(false);
    return (
      <div data-testid="host">
        {visible() ? (
          <Menubar>
            <MenubarMenu value="file">
              <MenubarTrigger>File</MenubarTrigger>
            </MenubarMenu>
          </Menubar>
        ) : null}
      </div>
    );
  });
  const host = view.container.querySelector<HTMLElement>(
    '[data-testid="host"]'
  )!;
  const failure = new Error('forced menubar structural commit failure');
  const insertion = vi.spyOn(host, 'insertBefore').mockImplementation(() => {
    throw failure;
  });
  visible.set(true);
  expect(() => flush()).toThrow(failure);
  insertion.mockRestore();
  expect(
    document.head.querySelectorAll('[data-askr-dynamic-styles]')
  ).toHaveLength(0);
  expect(view.container.textContent).toBe('');
  visible.set(false);
  flush();
  visible.set(true);
  flush();
  expect(view.container.textContent).toBe('File');
  expect(
    document.head.querySelector('[data-askr-dynamic-styles]')?.textContent
  ).toContain('[data-askr-menubar-root="true"]');
});
