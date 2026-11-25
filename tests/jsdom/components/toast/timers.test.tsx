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

  it('should dismiss sibling toasts on their separate deadlines', async () => {
    vi.useFakeTimers();
    container = mount(
      <ToastHost>
        <ToastViewport />
        <Toast id="first" defaultOpen duration={50}>
          <ToastTitle>First</ToastTitle>
        </Toast>
        <Toast id="second" defaultOpen duration={100}>
          <ToastTitle>Second</ToastTitle>
        </Toast>
      </ToastHost>
    );
    await flushUpdates();

    expect(container.querySelectorAll('[data-toast="true"]')).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(50);
    await flushUpdates();
    expect(container.querySelectorAll('[data-toast="true"]')).toHaveLength(1);
    expect(container.textContent).toContain('Second');
    await vi.advanceTimersByTimeAsync(50);
    await flushUpdates();
    expect(container.querySelectorAll('[data-toast="true"]')).toHaveLength(0);
  });
});
