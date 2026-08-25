import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { Button } from '../../../../src/components/button';
import { Input } from '../../../../src/components/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from '../../../../src/components/dialog';
import { flushUpdates, mount, unmount } from '../../test-utils';
import {
  Toast,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../../../src/components/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '../../../../src/components/select';

describe('Dialog - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    vi.restoreAllMocks();
    unmount(container);
  });

  it('should preserve the open portal subtree through controlled input updates', async () => {
    function Fixture() {
      const name = state('Ada');

      return (
        <Dialog id="controlled-input-dialog" defaultOpen>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <Input
                aria-label="Name"
                value={name()}
                onInput={(event) => name.set(event.target.value)}
              />
            </DialogContent>
          </DialogPortal>
        </Dialog>
      );
    }

    container = mount(<Fixture />);
    await flushUpdates();

    const dialog = document.body.querySelector('[data-slot="dialog-content"]');
    const input = document.body.querySelector(
      'input[aria-label="Name"]'
    ) as HTMLInputElement;
    const dialogId = dialog?.id;

    input.value = 'Grace';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flushUpdates();

    const updatedDialog = document.body.querySelector(
      '[data-slot="dialog-content"]'
    );
    const updatedInput = document.body.querySelector(
      'input[aria-label="Name"]'
    ) as HTMLInputElement;

    expect(
      document.body.querySelectorAll('[data-slot="dialog-overlay"]')
    ).toHaveLength(1);
    expect(
      document.body.querySelectorAll('[data-slot="dialog-content"]')
    ).toHaveLength(1);
    expect(
      document.body.querySelectorAll('input[aria-label="Name"]')
    ).toHaveLength(1);
    expect(updatedInput.value).toBe('Grace');
    expect(updatedDialog?.id).toBe(dialogId);
  });

  it('should keep portals isolated when separate renders reuse the same public id', async () => {
    function Fixture() {
      return (
        <div>
          <Dialog id="shared" defaultOpen>
            <DialogPortal>
              <DialogContent>First dialog</DialogContent>
            </DialogPortal>
          </Dialog>
          <Dialog id="shared" defaultOpen>
            <DialogPortal>
              <DialogContent>Second dialog</DialogContent>
            </DialogPortal>
          </Dialog>
        </div>
      );
    }

    container = mount(<Fixture />);
    await flushUpdates();

    const dialogs = Array.from(
      document.body.querySelectorAll('[data-slot="dialog-content"]')
    );

    expect(dialogs).toHaveLength(2);
    expect(dialogs[0]?.textContent).toBe('First dialog');
    expect(dialogs[1]?.textContent).toBe('Second dialog');

    unmount(container);
    container = mount(<Fixture />);
    await flushUpdates();

    const rerenderedDialogs = Array.from(
      document.body.querySelectorAll('[data-slot="dialog-content"]')
    );

    expect(rerenderedDialogs).toHaveLength(2);
    expect(rerenderedDialogs[0]?.textContent).toBe('First dialog');
    expect(rerenderedDialogs[1]?.textContent).toBe('Second dialog');
  });
  it('should toggle trigger expansion state when activated', async () => {
    container = mount(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogPortal>
          <DialogContent>Body</DialogContent>
        </DialogPortal>
      </Dialog>
    );

    let trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLButtonElement;
    trigger.click();
    await flushUpdates();
    trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    trigger.click();
    await flushUpdates();
    trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('should preserve button styling props when trigger and close compose as children', async () => {
    container = mount(
      <Dialog>
        <Button asChild variant="outline">
          <DialogTrigger>Open dialog</DialogTrigger>
        </Button>
        <DialogPortal>
          <DialogContent>
            Body
            <Button asChild variant="outline">
              <DialogClose>Close dialog</DialogClose>
            </Button>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );

    const trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('data-slot')).toBe('button');
    expect(trigger.getAttribute('data-dialog-trigger')).toBe('true');
    expect(trigger.getAttribute('data-variant')).toBe('outline');

    trigger.click();
    await flushUpdates();

    const close = document.body.querySelector(
      '[data-dialog-close="true"]'
    ) as HTMLButtonElement;

    expect(close.getAttribute('data-slot')).toBe('button');
    expect(close.getAttribute('data-variant')).toBe('outline');

    close.click();
    await flushUpdates();

    expect(
      document.body.querySelector('[data-slot="dialog-content"]')
    ).toBeNull();
  });

  it('should open and close through asChild Enter and Space presses', async () => {
    container = mount(
      <Dialog>
        <DialogTrigger asChild>
          <span>Open dialog</span>
        </DialogTrigger>
        <DialogPortal>
          <DialogContent>
            Body
            <DialogClose asChild>
              <span>Close dialog</span>
            </DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );

    let trigger = container.querySelector(
      '[data-slot="dialog-trigger"]'
    ) as HTMLElement;
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await flushUpdates();
    await flushUpdates();

    trigger = container.querySelector(
      '[data-slot="dialog-trigger"]'
    ) as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const close = document.body.querySelector(
      '[data-slot="dialog-close"]'
    ) as HTMLElement;
    close.focus();
    await userEvent.keyboard(' ');
    await flushUpdates();
    await flushUpdates();

    expect(
      document.body.querySelector('[data-slot="dialog-content"]')
    ).toBeNull();
  });

  it('should omit generated title and description references when those parts are absent', async () => {
    container = mount(
      <Dialog defaultOpen>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogPortal>
          <DialogContent aria-label="Preferences">Body</DialogContent>
        </DialogPortal>
      </Dialog>
    );

    await flushUpdates();

    const content = Array.from(
      document.body.querySelectorAll('[role="dialog"]')
    ).find((element) => element.textContent?.includes('Body')) as HTMLElement;

    expect(content.getAttribute('aria-label')).toBe('Preferences');
    expect(content.getAttribute('aria-labelledby')).toBeNull();
    expect(content.getAttribute('aria-describedby')).toBeNull();
  });

  it('should keep dialog open when DialogContent onDismiss is provided and handle Escape', async () => {
    const onDismiss = vi.fn();

    container = mount(
      <Dialog defaultOpen>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogPortal>
          <DialogContent onDismiss={onDismiss}>Body</DialogContent>
        </DialogPortal>
      </Dialog>
    );

    await flushUpdates();

    const content = Array.from(
      document.body.querySelectorAll('[data-slot="dialog-content"]')
    ).find((element) => element.textContent?.includes('Body')) as HTMLElement;

    content.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    await flushUpdates();

    const trigger = container.querySelector(
      '[data-slot="dialog-trigger"]'
    ) as HTMLElement;
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(
      document.body.querySelector('[data-slot="dialog-content"]')
    ).not.toBeNull();
  });

  it('should keep centered dialog content within viewport padding on narrow viewports', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      (callback: FrameRequestCallback) => {
        callback(0);
        return 0;
      }
    );
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(390);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(844);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function getBoundingClientRect(this: HTMLElement): DOMRect {
        const slot = this.getAttribute('data-slot');

        if (slot === 'dialog-content') {
          return {
            x: 0,
            y: 0,
            width: 374,
            height: 824,
            top: 0,
            right: 374,
            bottom: 824,
            left: 0,
            toJSON: () => ({}),
          } as DOMRect;
        }

        return {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          toJSON: () => ({}),
        } as DOMRect;
      }
    );

    container = mount(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogPortal>
          <DialogContent>Body</DialogContent>
        </DialogPortal>
      </Dialog>
    );

    const trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLButtonElement;
    trigger.click();
    await flushUpdates();

    const content = Array.from(
      document.body.querySelectorAll('[data-slot="dialog-content"]')
    ).find((element) => element.textContent?.includes('Body')) as HTMLElement;
    const style = getComputedStyle(content);

    expect(style.left).toBe('20px');
    expect(style.top).toBe('20px');
    expect(style.maxWidth).toBe('350px');
    expect(style.maxHeight).toBe('804px');
  });

  it('should keep modal dismissal and nested overlay stacking correct with other families', async () => {
    container = mount(
      <ToastHost duration={Number.POSITIVE_INFINITY}>
        <ToastViewport />
        <Dialog defaultOpen>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <Select defaultOpen defaultValue="one">
                <SelectTrigger>Choose</SelectTrigger>
                <SelectPortal>
                  <SelectContent>
                    <SelectItem value="one">One</SelectItem>
                  </SelectContent>
                </SelectPortal>
              </Select>
            </DialogContent>
          </DialogPortal>
        </Dialog>
        <Toast defaultOpen>
          <ToastTitle>Saved</ToastTitle>
        </Toast>
      </ToastHost>
    );
    await flushUpdates();
    await flushUpdates();

    const dialog = document.body.querySelector(
      '[data-slot="dialog-content"]'
    ) as HTMLElement;
    const select = document.body.querySelector(
      '[data-slot="select-content"]'
    ) as HTMLElement;
    expect(Number(getComputedStyle(select).zIndex)).toBeGreaterThan(
      Number(getComputedStyle(dialog).zIndex)
    );
    Array.from(document.body.querySelectorAll<HTMLElement>('[role="option"]'))
      .find((option) => option.textContent === 'One')
      ?.click();
    await flushUpdates();

    document.body
      .querySelector('[data-slot="dialog-overlay"]')
      ?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true })
      );
    await flushUpdates();

    expect(
      document.body.querySelector('[data-slot="dialog-content"]')
    ).toBeNull();
    expect(container.querySelector('[data-slot="toast"]')).not.toBeNull();
  });

  it('should stack a later dialog and its backdrop above an already-open select', async () => {
    function Fixture() {
      const secondOpen = state(false);

      return (
        <>
          <Dialog id="first-dialog" defaultOpen>
            <DialogPortal>
              <DialogOverlay />
              <DialogContent>
                First dialog
                <Select
                  open
                  defaultValue="one"
                  onValueChange={() => secondOpen.set(true)}
                >
                  <SelectTrigger>Choose</SelectTrigger>
                  <SelectPortal>
                    <SelectContent>
                      <SelectItem value="one">One</SelectItem>
                      <SelectItem value="two">Open second dialog</SelectItem>
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </DialogContent>
            </DialogPortal>
          </Dialog>
          <Dialog id="second-dialog" open={secondOpen()}>
            <DialogPortal>
              <DialogOverlay data-second-overlay="true" />
              <DialogContent>Second dialog</DialogContent>
            </DialogPortal>
          </Dialog>
        </>
      );
    }

    container = mount(<Fixture />);
    await flushUpdates();
    await flushUpdates();
    Array.from(document.body.querySelectorAll<HTMLElement>('[role="option"]'))
      .find((option) => option.textContent === 'Open second dialog')
      ?.click();
    await flushUpdates();
    await flushUpdates();

    const select = document.body.querySelector(
      '[data-slot="select-content"]'
    ) as HTMLElement;
    const secondDialog = Array.from(
      document.body.querySelectorAll<HTMLElement>(
        '[data-slot="dialog-content"]'
      )
    ).find((content) => content.textContent === 'Second dialog') as HTMLElement;
    const secondOverlay = document.body.querySelector(
      '[data-second-overlay="true"]'
    ) as HTMLElement;
    const selectZIndex = Number(getComputedStyle(select).zIndex);

    expect(
      secondOverlay.getAttribute('data-askr-overlay-stack-id')
    ).not.toBeNull();
    expect(Number(getComputedStyle(secondOverlay).zIndex)).toBeGreaterThan(
      selectZIndex
    );
    expect(Number(getComputedStyle(secondDialog).zIndex)).toBeGreaterThan(
      Number(getComputedStyle(secondOverlay).zIndex)
    );
  });
});
