import { state } from '@askrjs/askr';
import { Portal } from '@askrjs/askr/foundations';
import { Link } from '@askrjs/askr/router';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { Button } from '../../../../src/components/button';
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../../../src/components/toast';
import { flushUpdates, mount, unmount } from '../../test-utils';

function ControlledToastFixture() {
  const openState = state(true);

  return (
    <div>
      <button
        id="launcher"
        onClick={() => {
          openState.set(true);
        }}
      >
        Show toast
      </button>
      <ToastHost duration={1000}>
        <ToastViewport />
        <Toast open={openState()} onOpenChange={(open) => openState.set(open)}>
          <ToastTitle>Saved</ToastTitle>
          <ToastDescription>Changes stored</ToastDescription>
          <ToastClose>Dismiss</ToastClose>
        </Toast>
      </ToastHost>
    </div>
  );
}

function ControlledToastOpenerFixture() {
  const openState = state(false);

  return (
    <ToastHost duration={1000}>
      <button
        id="open-toast"
        onClick={() => {
          openState.set(true);
        }}
      >
        Open toast
      </button>
      <ToastViewport />
      <Toast
        open={openState()}
        onOpenChange={(open) => openState.set(open)}
        variant="success"
      >
        <ToastTitle>Message queued</ToastTitle>
        <ToastDescription>The note is ready for review.</ToastDescription>
        <ToastAction asChild>
          <a href="/logs">Review logs</a>
        </ToastAction>
        <ToastClose>Dismiss</ToastClose>
      </Toast>
    </ToastHost>
  );
}

function ControlledToastLinkActionFixture() {
  const openState = state(false);

  return (
    <ToastHost duration={1000}>
      <button
        id="open-link-toast"
        onClick={() => {
          openState.set(true);
        }}
      >
        Open link toast
      </button>
      <ToastViewport />
      <Toast
        open={openState()}
        onOpenChange={(open) => openState.set(open)}
        variant="success"
      >
        <span data-slot="toast-icon" aria-hidden="true">
          Icon
        </span>
        <ToastTitle>Message queued</ToastTitle>
        <ToastDescription>The note is ready for review.</ToastDescription>
        <ToastAction asChild>
          <Link href="/logs">Review logs</Link>
        </ToastAction>
        <ToastClose>Dismiss</ToastClose>
      </Toast>
    </ToastHost>
  );
}

function ControlledToastPressButtonFixture() {
  const openState = state(false);

  return (
    <ToastHost duration={1000}>
      <Button
        id="open-press-toast"
        type="button"
        onPress={() => {
          openState.set(true);
        }}
      >
        Open press toast
      </Button>
      <ToastViewport />
      <Toast
        open={openState()}
        onOpenChange={(open) => openState.set(open)}
        variant="success"
      >
        <ToastTitle>Message queued</ToastTitle>
        <ToastDescription>The note is ready for review.</ToastDescription>
        <ToastAction asChild>
          <Link href="/logs">Review logs</Link>
        </ToastAction>
        <ToastClose>Dismiss</ToastClose>
      </Toast>
    </ToastHost>
  );
}

function waitForScheduler(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 20);
  });
}

describe('Toast - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    vi.useRealTimers();
    unmount(container);
  });

  it('should coexist with a default Portal without scheduling an update loop', async () => {
    container = mount(
      <ToastHost>
        <Portal>
          <div>Portaled content</div>
        </Portal>
        <ToastViewport />
        <Toast open={false}>
          <ToastTitle>Closed notification</ToastTitle>
        </Toast>
      </ToastHost>
    );
    await flushUpdates();

    expect(document.body.textContent).toContain('Portaled content');
    expect(container.querySelector('[data-toast-root="true"]')).toBeNull();
  });

  it('should renders toast content inside the viewport in declaration order', async () => {
    container = mount(
      <ToastHost>
        <ToastViewport />
        <Toast defaultOpen={true}>
          <ToastTitle>First</ToastTitle>
        </Toast>
        <Toast defaultOpen={true}>
          <ToastTitle>Second</ToastTitle>
        </Toast>
      </ToastHost>
    );
    await flushUpdates();

    const titles = Array.from(
      container.querySelectorAll('[data-toast-title="true"]')
    ).map((node) => node.textContent);

    expect(titles).toEqual(['First', 'Second']);
  });

  it('should dismisses toasts on their configured timer', async () => {
    vi.useFakeTimers();
    container = mount(
      <ToastHost duration={50}>
        <ToastViewport />
        <Toast defaultOpen={true}>
          <ToastTitle>Timed</ToastTitle>
        </Toast>
      </ToastHost>
    );
    await flushUpdates();

    expect(container.querySelector('[data-toast="true"]')).not.toBeNull();

    await vi.runAllTimersAsync();
    await flushUpdates();
    await flushUpdates();

    expect(container.querySelector('[data-toast="true"]')).toBeNull();
  });

  it('should dismisses multiple open toasts when timers expire at the same time', async () => {
    vi.useFakeTimers();
    container = mount(
      <ToastHost duration={40}>
        <ToastViewport />
        <Toast id="first" defaultOpen={true}>
          <ToastTitle>First timed</ToastTitle>
        </Toast>
        <Toast id="second" defaultOpen={true}>
          <ToastTitle>Second timed</ToastTitle>
        </Toast>
      </ToastHost>
    );
    await flushUpdates();

    expect(container.querySelectorAll('[data-toast="true"]').length).toBe(2);

    await vi.advanceTimersByTimeAsync(60);
    await flushUpdates();

    expect(container.querySelectorAll('[data-toast="true"]').length).toBe(0);
  });

  it('should restores focus after closing a controlled toast', async () => {
    container = mount(<ControlledToastFixture />);

    const launcher = container.querySelector('#launcher') as HTMLButtonElement;
    launcher.focus();
    await flushUpdates();
    await flushUpdates();

    expect(container.querySelector('[data-toast="true"]')).not.toBeNull();

    const close = container.querySelector(
      '[data-toast-close="true"]'
    ) as HTMLButtonElement;
    close.click();
    await flushUpdates();
    await flushUpdates();

    expect(document.activeElement).toBe(launcher);
  });

  it('should opens a controlled toast from a user action without locking the page', async () => {
    container = mount(<ControlledToastOpenerFixture />);
    await flushUpdates();

    const launcher = container.querySelector(
      '#open-toast'
    ) as HTMLButtonElement;
    launcher.click();
    await flushUpdates();
    await waitForScheduler();
    await flushUpdates();
    await waitForScheduler();
    await flushUpdates();

    const toast = container.querySelector('[data-toast="true"]');
    const action = container.querySelector(
      '[data-toast-action="true"]'
    ) as HTMLAnchorElement;

    expect(toast).not.toBeNull();
    expect(action.tagName).toBe('A');
    expect(action.getAttribute('href')).toBe('/logs');
  });

  it('should opens a controlled toast with a link action without locking the page', async () => {
    container = mount(<ControlledToastLinkActionFixture />);
    await flushUpdates();

    const launcher = container.querySelector(
      '#open-link-toast'
    ) as HTMLButtonElement;
    launcher.click();
    await flushUpdates();
    await waitForScheduler();
    await flushUpdates();

    const toast = container.querySelector('[data-toast="true"]');
    const action = container.querySelector(
      '[data-toast-action="true"]'
    ) as HTMLAnchorElement;

    expect(toast).not.toBeNull();
    expect(action.tagName).toBe('A');
    expect(action.getAttribute('href')).toBe('/logs');
  });

  it('should opens a controlled toast from a press button without locking the page', async () => {
    container = mount(<ControlledToastPressButtonFixture />);
    await flushUpdates();

    const launcher = container.querySelector(
      '#open-press-toast'
    ) as HTMLButtonElement;
    launcher.focus();
    launcher.click();
    await flushUpdates();
    await waitForScheduler();
    await flushUpdates();

    expect(container.querySelector('[data-toast="true"]')).not.toBeNull();
  });

  it('should dismisses on escape and action press', async () => {
    container = mount(
      <ToastHost>
        <ToastViewport />
        <Toast defaultOpen={true}>
          <ToastTitle>Undoable</ToastTitle>
          <ToastAction>Undo</ToastAction>
        </Toast>
      </ToastHost>
    );
    await flushUpdates();

    const toast = container.querySelector(
      '[data-toast="true"]'
    ) as HTMLDivElement;
    toast.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    await flushUpdates();
    expect(container.querySelector('[data-toast="true"]')).toBeNull();

    container = mount(
      <ToastHost>
        <ToastViewport />
        <Toast defaultOpen={true}>
          <ToastTitle>Undoable</ToastTitle>
          <ToastAction>Undo</ToastAction>
        </Toast>
      </ToastHost>
    );
    await flushUpdates();

    const action = container.querySelector(
      '[data-toast-action="true"]'
    ) as HTMLButtonElement;
    action.click();
    await flushUpdates();
    expect(container.querySelector('[data-toast="true"]')).toBeNull();
  });

  it('should preserves action styling and href when composed with a link child', async () => {
    container = mount(
      <ToastHost>
        <ToastViewport />
        <Toast defaultOpen={true}>
          <ToastTitle>Queued</ToastTitle>
          <ToastAction asChild>
            <a href="/logs">View logs</a>
          </ToastAction>
        </Toast>
      </ToastHost>
    );
    await flushUpdates();

    const action = container.querySelector(
      '[data-toast-action="true"]'
    ) as HTMLAnchorElement;

    expect(action.tagName).toBe('A');
    expect(action.getAttribute('data-slot')).toBe('toast-action');
    expect(action.getAttribute('href')).toBe('/logs');
  });
});
