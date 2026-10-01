import { state } from '@askrjs/askr';
import { Portal } from '@askrjs/askr/foundations';
import { Link } from '@askrjs/askr/router';
import { Button } from '../../../../../src/components/button';
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../../../../src/components/toast';
import { flushUpdates, mount, settle } from '../../_mount';

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
      <button id="elsewhere">Elsewhere</button>
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

function SiblingToastRegistrationFixture() {
  const siblingOpen = state(false);

  return (
    <ToastHost duration={100}>
      <button
        id="open-sibling-toast"
        onClick={() => {
          siblingOpen.set(!siblingOpen());
        }}
      >
        Open sibling
      </button>
      <ToastViewport />
      <Toast id="original-toast" defaultOpen>
        <ToastTitle>Original</ToastTitle>
        <ToastClose>Dismiss original</ToastClose>
      </Toast>
      <Toast
        id="sibling-toast"
        open={siblingOpen()}
        onOpenChange={(open) => siblingOpen.set(open)}
      >
        <ToastTitle>Sibling</ToastTitle>
      </Toast>
    </ToastHost>
  );
}

/**
 * Controls shared by every toast scenario: `markToast` remembers the element
 * `selector` matches now, and `isMarkedToast` reports whether the same element
 * (not a re-created one) still matches later — the `toBe(toast)` identity
 * check of the old suite.
 */
function identityControls(container: HTMLElement) {
  let marked: Element | null = null;
  return {
    markToast: (selector = '[data-toast="true"]') => {
      marked = container.querySelector(selector);
      return marked !== null;
    },
    isMarkedToast: (selector = '[data-toast="true"]') =>
      marked !== null && container.querySelector(selector) === marked,
    /** Calls `element.click()` without moving focus, as the old suite did. */
    click: async (selector: string) => {
      (container.querySelector(selector) as HTMLElement).click();
      await flushUpdates();
      await flushUpdates();
    },
    settle,
  };
}

export function withDefaultPortal(root: HTMLElement) {
  const container = mount(
    <ToastHost>
      <Portal>
        <div>Portaled content</div>
      </Portal>
      <ToastViewport />
      <Toast open={false}>
        <ToastTitle>Closed notification</ToastTitle>
      </Toast>
    </ToastHost>,
    root
  );

  return {
    settle,
    bodyText: () => document.body.textContent ?? '',
    hasToast: () => container.querySelector('[data-toast="true"]') !== null,
  };
}

export function declarationOrder(root: HTMLElement): void {
  mount(
    <ToastHost>
      <ToastViewport />
      <Toast defaultOpen={true}>
        <ToastTitle>First</ToastTitle>
      </Toast>
      <Toast defaultOpen={true}>
        <ToastTitle>Second</ToastTitle>
      </Toast>
    </ToastHost>,
    root
  );
}

export function infiniteDuration(root: HTMLElement): void {
  mount(
    <ToastHost duration={Number.POSITIVE_INFINITY}>
      <ToastViewport />
      <Toast defaultOpen>
        <ToastTitle>Persistent</ToastTitle>
      </Toast>
    </ToastHost>,
    root
  );
}

export function hoverTimed(root: HTMLElement) {
  const container = mount(
    <ToastHost duration={800}>
      <ToastViewport />
      <Toast defaultOpen>
        <ToastTitle>Hover timed</ToastTitle>
      </Toast>
    </ToastHost>,
    root
  );
  return identityControls(container);
}

export function focusTimed(root: HTMLElement) {
  const container = mount(
    <ToastHost duration={800}>
      <button id="outside">Outside</button>
      <ToastViewport />
      <Toast defaultOpen>
        <ToastTitle>Focus timed</ToastTitle>
        <ToastClose>Close</ToastClose>
      </Toast>
    </ToastHost>,
    root
  );
  return identityControls(container);
}

export function siblingRegistration(root: HTMLElement) {
  return identityControls(mount(<SiblingToastRegistrationFixture />, root));
}

export function controlledToast(root: HTMLElement) {
  return identityControls(mount(<ControlledToastFixture />, root));
}

export function controlledOpener(root: HTMLElement): void {
  mount(<ControlledToastOpenerFixture />, root);
}

export function controlledLinkAction(root: HTMLElement): void {
  mount(<ControlledToastLinkActionFixture />, root);
}

export function controlledPressButton(root: HTMLElement): void {
  mount(<ControlledToastPressButtonFixture />, root);
}

export function undoable(root: HTMLElement): void {
  mount(
    <ToastHost>
      <ToastViewport />
      <Toast defaultOpen={true}>
        <ToastTitle>Undoable</ToastTitle>
        <ToastAction>Undo</ToastAction>
      </Toast>
    </ToastHost>,
    root
  );
}

export function asChildAction(root: HTMLElement): void {
  mount(
    <ToastHost duration={60_000}>
      <ToastViewport />
      <Toast defaultOpen>
        <ToastTitle>Action toast</ToastTitle>
        <ToastAction asChild>
          <span>Undo</span>
        </ToastAction>
      </Toast>
    </ToastHost>,
    root
  );
}

export function asChildClose(root: HTMLElement): void {
  mount(
    <ToastHost duration={60_000}>
      <ToastViewport />
      <Toast defaultOpen>
        <ToastTitle>Close toast</ToastTitle>
        <ToastClose asChild>
          <span>Dismiss</span>
        </ToastClose>
      </Toast>
    </ToastHost>,
    root
  );
}

export function linkAction(root: HTMLElement): void {
  mount(
    <ToastHost>
      <ToastViewport />
      <Toast defaultOpen={true}>
        <ToastTitle>Queued</ToastTitle>
        <ToastAction asChild>
          <a href="/logs">View logs</a>
        </ToastAction>
      </Toast>
    </ToastHost>,
    root
  );
}
