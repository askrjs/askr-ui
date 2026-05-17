import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogPortal,
  AlertDialogTrigger,
} from '../../../../src/components/alert-dialog';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('AlertDialog - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('keeps trigger expansion state open after re-activation', async () => {
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

  it('forwards dismiss callbacks from alert dialog content', async () => {
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
});
