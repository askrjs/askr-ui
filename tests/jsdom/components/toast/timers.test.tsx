import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  Toast,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../../../src/components/toast';
import { flushUpdates, mount, unmount } from '../../test-utils';

async function drainTimers() {
  await vi.runAllTimersAsync();
  await flushUpdates();
  await vi.runAllTimersAsync();
  await flushUpdates();
}

describe('Toast timers', () => {
  let container: HTMLElement;

  afterEach(() => {
    vi.useRealTimers();
    unmount(container);
  });

  it('should dismiss a mounted toast after its configured duration', async () => {
    vi.useFakeTimers();
    container = mount(
      <ToastHost duration={50}>
        <ToastViewport />
        <Toast defaultOpen>
          <ToastTitle>Timed</ToastTitle>
        </Toast>
      </ToastHost>
    );
    await flushUpdates();

    expect(container.querySelectorAll('[data-toast="true"]')).toHaveLength(1);
    await drainTimers();
    expect(container.querySelectorAll('[data-toast="true"]')).toHaveLength(0);
  });

  it('should dismiss simultaneous sibling toasts independently', async () => {
    vi.useFakeTimers();
    container = mount(
      <ToastHost duration={50}>
        <ToastViewport />
        <Toast id="first" defaultOpen>
          <ToastTitle>First</ToastTitle>
        </Toast>
        <Toast id="second" defaultOpen>
          <ToastTitle>Second</ToastTitle>
        </Toast>
      </ToastHost>
    );
    await flushUpdates();

    expect(container.querySelectorAll('[data-toast="true"]')).toHaveLength(2);
    await drainTimers();
    expect(container.querySelectorAll('[data-toast="true"]')).toHaveLength(0);
  });
});
