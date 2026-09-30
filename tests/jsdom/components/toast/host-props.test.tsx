import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';
import { state } from '@askrjs/askr';
import {
  Toast,
  ToastDescription,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../../../src/components/toast';
import { flushUpdates, mount, unmount } from '../../test-utils';

type HostProps = {
  duration: number;
  id?: string;
  toasts: string[];
  /** Per-toast `duration` overrides, keyed by toast id. */
  toastDurations?: Record<string, number>;
  /** Changes nothing but forces the parent to re-render. */
  version?: number;
};

/**
 * Renders ToastHost from parent state so a test can change its props after
 * mount and add toasts that inherit the host's current duration.
 */
function renderHost(initial: HostProps) {
  let setProps: (next: Partial<HostProps>) => void = () => {};

  const Parent = () => {
    const props = state<HostProps>(initial);
    setProps = (next) => props.set({ ...props(), ...next });
    const current = props();
    return (
      <ToastHost
        duration={current.duration}
        id={current.id}
        data-version={current.version ?? 0}
      >
        <ToastViewport />
        {current.toasts.map((toastId) => (
          <Toast
            key={toastId}
            id={toastId}
            duration={current.toastDurations?.[toastId]}
            defaultOpen
          >
            <ToastTitle>{`Title ${toastId}`}</ToastTitle>
            <ToastDescription>{`Description ${toastId}`}</ToastDescription>
          </Toast>
        ))}
      </ToastHost>
    );
  };

  const container = mount(<Parent />);
  return {
    container,
    toast: (toastId: string) =>
      container.querySelector<HTMLElement>(
        `[data-toast="true"][id$="${toastId}"]`
      ),
    toastCount: () => container.querySelectorAll('[data-toast="true"]').length,
    setProps: async (next: Partial<HostProps>) => {
      setProps(next);
      await flushUpdates();
      await flushUpdates();
    },
  };
}

async function advance(ms: number) {
  await vi.advanceTimersByTimeAsync(ms);
  await flushUpdates();
  await flushUpdates();
}

describe('ToastHost - props changed after mount', () => {
  let container: HTMLElement | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    unmount(container);
    container = undefined;
    vi.useRealTimers();
  });

  it('should time a toast added after a duration change with the new duration', async () => {
    const host = renderHost({ duration: 10_000, toasts: [] });
    container = host.container;
    await flushUpdates();

    await host.setProps({ duration: 100 });
    await host.setProps({ toasts: ['late'] });

    expect(host.toastCount()).toBe(1);
    await advance(150);
    expect(host.toastCount()).toBe(0);
  });

  it('should keep an added toast open until the new, longer duration elapses', async () => {
    const host = renderHost({ duration: 100, toasts: [] });
    container = host.container;
    await flushUpdates();

    await host.setProps({ duration: 10_000 });
    await host.setProps({ toasts: ['late'] });

    await advance(500);
    expect(host.toastCount()).toBe(1);
    await advance(10_000);
    expect(host.toastCount()).toBe(0);
  });

  it('should keep toast ids and aria wiring intact after the host id changes', async () => {
    const host = renderHost({ duration: 10_000, id: 'first', toasts: ['a'] });
    container = host.container;
    await flushUpdates();

    await host.setProps({ id: 'second' });
    await host.setProps({ toasts: ['a', 'b'] });

    for (const toastId of ['a', 'b']) {
      const toast = host.toast(toastId);
      expect(toast).not.toBeNull();
      const title = toast!.querySelector('[data-toast-title="true"]');
      const description = toast!.querySelector(
        '[data-toast-description="true"]'
      );
      expect(toast!.getAttribute('aria-labelledby')).toBe(title?.id);
      expect(toast!.getAttribute('aria-describedby')).toBe(description?.id);
      expect(title?.textContent).toBe(`Title ${toastId}`);
    }
    expect(host.toastCount()).toBe(2);

    await advance(10_100);
    expect(host.toastCount()).toBe(0);
  });

  it('should retime an open toast when the host duration shrinks', async () => {
    const host = renderHost({ duration: 10_000, toasts: ['a'] });
    container = host.container;
    await flushUpdates();

    await host.setProps({ duration: 100 });

    expect(host.toastCount()).toBe(1);
    await advance(150);
    expect(host.toastCount()).toBe(0);
  });

  it('should retime an open toast when the host duration grows', async () => {
    const host = renderHost({ duration: 200, toasts: ['a'] });
    container = host.container;
    await flushUpdates();

    await advance(100);
    await host.setProps({ duration: 10_000 });

    await advance(500);
    expect(host.toastCount()).toBe(1);
    await advance(10_000);
    expect(host.toastCount()).toBe(0);
  });

  it('should leave a toast with its own duration alone when the host duration changes', async () => {
    const host = renderHost({
      duration: 10_000,
      toasts: ['own'],
      toastDurations: { own: 10_000 },
    });
    container = host.container;
    await flushUpdates();

    await host.setProps({ duration: 100 });

    await advance(500);
    expect(host.toastCount()).toBe(1);
  });

  it('should not restart an open toast timer when the host re-renders with the same duration', async () => {
    const host = renderHost({ duration: 300, toasts: ['a'] });
    container = host.container;
    await flushUpdates();

    await advance(200);
    await host.setProps({ version: 1 });
    await advance(150);

    expect(host.toastCount()).toBe(0);
  });

  it('should keep a hovered toast paused when the host duration changes', async () => {
    const host = renderHost({ duration: 10_000, toasts: ['a'] });
    container = host.container;
    await flushUpdates();

    host.toast('a')!.dispatchEvent(new Event('pointerenter'));
    await host.setProps({ duration: 100 });
    await advance(500);
    expect(host.toastCount()).toBe(1);

    host.toast('a')!.dispatchEvent(new Event('pointerleave'));
    await advance(150);
    expect(host.toastCount()).toBe(0);
  });
});
