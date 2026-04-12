import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  Dialog,
  DialogPortal,
  DialogContent,
  DialogTrigger,
} from '../../../src/components/composites/dialog';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Dialog - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('toggles trigger expansion state when activated', async () => {
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

  it('omits generated title and description references when those parts are absent', async () => {
    container = mount(
      <Dialog defaultOpen>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogPortal>
          <DialogContent aria-label="Preferences">Body</DialogContent>
        </DialogPortal>
      </Dialog>
    );

    await flushUpdates();

    const content = Array.from(document.body.querySelectorAll('[role="dialog"]'))
      .find((element) => element.textContent?.includes('Body')) as HTMLElement;

    expect(content.getAttribute('aria-label')).toBe('Preferences');
    expect(content.getAttribute('aria-labelledby')).toBeNull();
    expect(content.getAttribute('aria-describedby')).toBeNull();
  });

  it('keeps dialog open when DialogContent onDismiss is provided and handles Escape', async () => {
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

    content.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await flushUpdates();

    const trigger = container.querySelector('[data-slot="dialog-trigger"]') as HTMLElement;
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.body.querySelector('[data-slot="dialog-content"]')).not.toBeNull();
  });
});
