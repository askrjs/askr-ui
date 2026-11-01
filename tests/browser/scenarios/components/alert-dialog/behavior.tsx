import { state } from '@askrjs/askr';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../../../src/components/alert-dialog';
import { Button } from '../../../../../src/components/button';
import { mount, spy } from '../../_mount';

export function controlledEscapeRequest(root: HTMLElement) {
  const onOpenChange = spy<[boolean]>();
  mount(
    <AlertDialog open={true} onOpenChange={onOpenChange}>
      <AlertDialogTrigger>Preview</AlertDialogTrigger>
      <AlertDialogContent aria-label="Preview">Confirmation</AlertDialogContent>
    </AlertDialog>,
    root
  );
  return { openChanges: () => onOpenChange.calls };
}

export function defaultAndExplicitRole(root: HTMLElement): void {
  mount(
    <>
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogContent>Default role</AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogContent role="dialog">Explicit role</AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>,
    root
  );
}

export function triggered(root: HTMLElement): void {
  mount(
    <AlertDialog>
      <AlertDialogTrigger>Open alert</AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogContent>Confirm action</AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>,
    root
  );
}

export function composedButtons(root: HTMLElement): void {
  mount(
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
    </AlertDialog>,
    root
  );
}

export function dismissCallback(root: HTMLElement) {
  const onDismiss = spy();
  mount(
    <AlertDialog defaultOpen>
      <AlertDialogTrigger>Open alert</AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogContent onDismiss={onDismiss}>
          Confirm action
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>,
    root
  );

  return { dismissCount: () => onDismiss.count() };
}

export function outsidePointerBlocked(root: HTMLElement) {
  const onPointerDownOutside = spy();
  mount(
    <AlertDialog defaultOpen>
      <AlertDialogPortal>
        <AlertDialogContent onPointerDownOutside={onPointerDownOutside}>
          Confirm action
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>,
    root
  );
  return { outsideCalls: () => onPointerDownOutside.count() };
}

export function escapeCanceled(root: HTMLElement) {
  const onEscapeKeyDown = spy<[KeyboardEvent]>((event) =>
    event.preventDefault()
  );
  mount(
    <AlertDialog defaultOpen>
      <AlertDialogPortal>
        <AlertDialogContent onEscapeKeyDown={onEscapeKeyDown}>
          Confirm action
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>,
    root
  );
  return { escapeCalls: () => onEscapeKeyDown.count() };
}

export function asChildRefs(root: HTMLElement) {
  const triggerRef = { current: null as HTMLButtonElement | null };
  const overlayRef = { current: null as HTMLDivElement | null };
  const contentRef = { current: null as HTMLElement | null };
  const titleRef = { current: null as HTMLHeadingElement | null };
  const descriptionRef = { current: null as HTMLParagraphElement | null };
  const cancelRef = { current: null as HTMLButtonElement | null };
  const actionRef = { current: null as HTMLButtonElement | null };
  mount(
    <AlertDialog defaultOpen>
      <AlertDialogTrigger asChild>
        <button ref={triggerRef}>Open</button>
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay asChild>
          <div ref={overlayRef} />
        </AlertDialogOverlay>
        <AlertDialogContent asChild>
          <section ref={contentRef}>
            <AlertDialogTitle asChild>
              <h2 ref={titleRef}>Confirm</h2>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p ref={descriptionRef}>Description</p>
            </AlertDialogDescription>
            <AlertDialogCancel asChild>
              <button ref={cancelRef}>Cancel</button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <button ref={actionRef}>Confirm action</button>
            </AlertDialogAction>
          </section>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>,
    root
  );
  return {
    refChecks: () => {
      const byText = (text: string) =>
        Array.from(
          document.body.querySelectorAll<HTMLButtonElement>(
            '[data-dialog-close="true"]'
          )
        ).find((button) => button.textContent?.trim() === text);
      return {
        trigger:
          triggerRef.current ===
          document.body.querySelector('[data-slot="dialog-trigger"]'),
        overlay:
          overlayRef.current ===
          document.body.querySelector('[data-slot="dialog-overlay"]'),
        content:
          contentRef.current ===
          document.body.querySelector('[data-slot="dialog-content"]'),
        title:
          titleRef.current ===
          document.body.querySelector('[data-slot="dialog-title"]'),
        description:
          descriptionRef.current ===
          document.body.querySelector('[data-slot="dialog-description"]'),
        cancel: cancelRef.current === byText('Cancel'),
        action: actionRef.current === byText('Confirm action'),
      };
    },
  };
}

export function persistentRestoreTarget(root: HTMLElement) {
  let persistentTrigger!: HTMLButtonElement;

  function Fixture() {
    const open = state(false);
    return (
      <>
        <button
          ref={(node) => (persistentTrigger = node!)}
          onClick={() => open.set(true)}
        >
          Open invite actions
        </button>
        <AlertDialog
          open={open()}
          onOpenChange={(nextOpen) => open.set(nextOpen)}
        >
          <AlertDialogPortal>
            <AlertDialogContent restoreFocus={() => persistentTrigger}>
              Reset active invite link?
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Reset link</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>
      </>
    );
  }

  mount(<Fixture />, root);

  return {
    focusInContent: () =>
      document.body
        .querySelector('[data-slot="dialog-content"]')
        ?.contains(document.activeElement) ?? false,
    focusOnPersistentTrigger: () =>
      document.activeElement === persistentTrigger,
  };
}

/**
 * Gives the content a real 374x824 box, so in a 390x844 viewport it is larger
 * than the viewport minus the 20px padding on both axes.
 */
export function narrowViewport(root: HTMLElement): void {
  const style = document.createElement('style');
  style.textContent = `
    [data-slot="dialog-content"] {
      box-sizing: border-box;
      width: 374px;
      height: 824px;
    }
  `;
  root.append(style);
  mount(
    <AlertDialog>
      <AlertDialogTrigger>Open alert</AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogContent>Confirm action</AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>,
    root
  );
}
