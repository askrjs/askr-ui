import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { Button } from '../../../../src/components/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogPortal,
  AlertDialogTrigger,
} from '../../../../src/components/alert-dialog';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('AlertDialog - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    vi.restoreAllMocks();
    unmount(container);
  });

  it('should keeps trigger expansion state open after re-activation', async () => {
    container = mount(
      <AlertDialog>
        <AlertDialogTrigger>Open alert</AlertDialogTrigger>
        <AlertDialogPortal>
          <AlertDialogContent>Confirm action</AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
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
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('should preserves button styling props when composed controls are children', async () => {
    container = mount(
      <AlertDialog>
        <Button asChild variant="destructive">
          <AlertDialogTrigger>Reset links</AlertDialogTrigger>
        </Button>
        <AlertDialogPortal>
          <AlertDialogContent>
            Confirm action
            <Button asChild variant="outline">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </Button>
            <Button asChild variant="destructive">
              <AlertDialogAction>Reset links</AlertDialogAction>
            </Button>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    );

    const trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('data-slot')).toBe('button');
    expect(trigger.getAttribute('data-variant')).toBe('destructive');

    trigger.click();
    await flushUpdates();

    const controls = Array.from(
      document.body.querySelectorAll('[data-dialog-close="true"]')
    ) as HTMLButtonElement[];

    expect(
      controls.map((control) => control.getAttribute('data-slot'))
    ).toEqual(['button', 'button']);
    expect(
      controls.map((control) => control.getAttribute('data-variant'))
    ).toEqual(['outline', 'destructive']);

    controls[0]?.click();
    await flushUpdates();

    expect(
      document.body.querySelector('[data-slot="dialog-content"]')
    ).toBeNull();
  });

  it('should forwards dismiss callbacks from alert dialog content', async () => {
    const onDismiss = vi.fn();

    container = mount(
      <AlertDialog defaultOpen>
        <AlertDialogTrigger>Open alert</AlertDialogTrigger>
        <AlertDialogPortal>
          <AlertDialogContent onDismiss={onDismiss}>
            Confirm action
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    );

    await flushUpdates();

    const content = document.body.querySelector(
      '[data-slot="dialog-content"]'
    ) as HTMLElement;
    content.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })
    );

    await flushUpdates();
    await flushUpdates();

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(
      document.body.querySelector('[data-slot="dialog-content"]')
    ).toBeNull();
  });

  it('should keeps centered alert dialog content within viewport padding on narrow viewports', async () => {
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
      <AlertDialog>
        <AlertDialogTrigger>Open alert</AlertDialogTrigger>
        <AlertDialogPortal>
          <AlertDialogContent>Confirm action</AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    );

    const trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLButtonElement;
    trigger.click();
    await flushUpdates();

    const content = document.body.querySelector(
      '[data-slot="dialog-content"]'
    ) as HTMLElement;
    const style = getComputedStyle(content);

    expect(style.left).toBe('20px');
    expect(style.top).toBe('20px');
    expect(style.maxWidth).toBe('350px');
    expect(style.maxHeight).toBe('804px');
  });
});
