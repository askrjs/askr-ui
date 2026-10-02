import { state } from '@askrjs/askr';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogPortal,
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
