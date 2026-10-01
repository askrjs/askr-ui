import { state } from '@askrjs/askr';
import { Button } from '../../../../../src/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '../../../../../src/components/dialog';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownPortal,
  DropdownTrigger,
} from '../../../../../src/components/dropdown';
import { Input } from '../../../../../src/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '../../../../../src/components/select';
import {
  Toast,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../../../../src/components/toast';
import { flushUpdates, mount, spy, unmount } from '../../_mount';

export function customPartIds(root: HTMLElement): void {
  mount(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogTitle id="custom-title">Custom title</DialogTitle>
        <DialogDescription id="custom-description">
          Custom description
        </DialogDescription>
      </DialogContent>
    </Dialog>,
    root
  );
}

export function callerAriaWithParts(root: HTMLElement): void {
  mount(
    <>
      <span id="external-title">External title</span>
      <span id="external-description">External description</span>
      <Dialog defaultOpen>
        <DialogContent
          aria-labelledby="external-title"
          aria-describedby="external-description"
        >
          <DialogTitle>Internal title</DialogTitle>
          <DialogDescription>Internal description</DialogDescription>
        </DialogContent>
      </Dialog>
    </>,
    root
  );
}

export function reactivePartIds(root: HTMLElement) {
  let titleReads = 0;
  let descriptionReads = 0;
  let suffix!: ReturnType<typeof state<string>>;
  function Fixture() {
    suffix = state('initial');
    return (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle
            id={() => {
              titleReads++;
              return `title-${suffix()}`;
            }}
          >
            Reactive title
          </DialogTitle>
          <DialogDescription
            id={() => {
              descriptionReads++;
              return `description-${suffix()}`;
            }}
          >
            Reactive description
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }
  mount(<Fixture />, root);
  return {
    reads: () => ({ title: titleReads, description: descriptionReads }),
    update: async () => {
      suffix.set('updated');
      await flushUpdates();
    },
  };
}

export function conditionalParts(root: HTMLElement) {
  let visible!: ReturnType<typeof state<boolean>>;
  function Parts() {
    return visible() ? (
      <>
        <DialogTitle id="conditional-title">Conditional title</DialogTitle>
        <DialogDescription id="conditional-description">
          Conditional description
        </DialogDescription>
      </>
    ) : null;
  }
  function Fixture() {
    visible = state(true);
    return (
      <Dialog defaultOpen>
        <DialogContent>
          <Parts />
          Body
        </DialogContent>
      </Dialog>
    );
  }
  mount(<Fixture />, root);
  return {
    setVisible: async (next: boolean) => {
      visible.set(next);
      await flushUpdates();
    },
  };
}

export function absentCallerAria(
  root: HTMLElement,
  options: { nullAria?: boolean } | null
): void {
  const aria = options?.nullAria ? null : undefined;
  mount(
    <Dialog defaultOpen>
      <DialogContent aria-labelledby={aria} aria-describedby={aria}>
        <DialogTitle id="absent-title">Title</DialogTitle>
        <DialogDescription id="absent-description">
          Description
        </DialogDescription>
      </DialogContent>
    </Dialog>,
    root
  );
}

export function generatedPartAssociations(root: HTMLElement): void {
  mount(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogTitle>Generated title</DialogTitle>
        <DialogDescription>Generated description</DialogDescription>
      </DialogContent>
    </Dialog>,
    root
  );
}

export function customContentControls(
  root: HTMLElement,
  options: { callerControls?: boolean } | null
): void {
  mount(
    <Dialog defaultOpen>
      <DialogTrigger
        aria-controls={
          options?.callerControls ? 'external-controls' : undefined
        }
      >
        Controls
      </DialogTrigger>
      <DialogContent id="custom-dialog-content" aria-label="Custom content">
        Body
      </DialogContent>
    </Dialog>,
    root
  );
}

export function reactiveContentControls(root: HTMLElement) {
  let idReads = 0;
  let suffix!: ReturnType<typeof state<string>>;
  function Fixture() {
    suffix = state('initial');
    return (
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent
          id={() => {
            idReads++;
            return `content-${suffix()}`;
          }}
        >
          <DialogTitle>Reactive content</DialogTitle>
        </DialogContent>
      </Dialog>
    );
  }
  mount(<Fixture />, root);
  return {
    reads: () => idReads,
    update: async () => {
      suffix.set('updated');
      await flushUpdates();
    },
  };
}

export function nestedPortaledParts(root: HTMLElement): void {
  function Parts() {
    return (
      <>
        <DialogTitle id="portaled-title">Portaled title</DialogTitle>
        <DialogDescription id="portaled-description">
          Portaled description
        </DialogDescription>
      </>
    );
  }
  mount(
    <Dialog defaultOpen modal={false}>
      <DialogContent>
        <DialogTitle id="outer-native-title">Outer title</DialogTitle>
        <Dialog defaultOpen>
          <DialogPortal>
            <DialogContent>
              <Parts />
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </DialogContent>
    </Dialog>,
    root
  );
}

export function reopenedParts(root: HTMLElement) {
  let open!: ReturnType<typeof state<boolean>>;
  function Fixture() {
    open = state(true);
    return (
      <Dialog open={open()} onOpenChange={open.set}>
        <DialogContent>
          <DialogTitle id="reopened-title">Reopened title</DialogTitle>
          <DialogDescription id="reopened-description">
            Reopened description
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }
  mount(<Fixture />, root);
  return {
    setOpen: async (next: boolean) => {
      open.set(next);
      await flushUpdates();
    },
  };
}

export function ancestorCanceledTrigger(
  root: HTMLElement,
  options: { asChild?: boolean; mode?: string } | null
) {
  const onPress = spy();
  const onOpenChange = spy<[boolean]>();
  const mode = options?.mode ?? 'click';
  root.addEventListener(
    mode === 'click' ? 'click' : mode === 'Space' ? 'keyup' : 'keydown',
    (event) => event.preventDefault(),
    { capture: true, once: true }
  );
  mount(
    <Dialog onOpenChange={onOpenChange}>
      {options?.asChild ? (
        <DialogTrigger asChild onPress={onPress}>
          <div tabIndex={0}>Preview</div>
        </DialogTrigger>
      ) : (
        <DialogTrigger onPress={onPress}>Preview</DialogTrigger>
      )}
      <DialogContent aria-label="Preview">Details</DialogContent>
    </Dialog>,
    root
  );
  return {
    pressCount: () => onPress.count(),
    openChanges: () => onOpenChange.calls,
  };
}

export function forceMountedToggle(root: HTMLElement): void {
  function Fixture() {
    const open = state(false);
    return (
      <Dialog open={open()} onOpenChange={open.set}>
        <DialogTrigger tabIndex={0}>Preview</DialogTrigger>
        <DialogContent forceMount aria-label="Preview">
          <button tabIndex={0}>Content action</button>
        </DialogContent>
      </Dialog>
    );
  }
  mount(<Fixture />, root);
}

export function forceMountedClosed(root: HTMLElement) {
  const before = document.createElement('button');
  before.dataset.testid = 'before';
  before.textContent = 'Before';
  root.append(before);
  before.focus();
  const onOpenChange = spy<[boolean]>();
  mount(
    <Dialog open={false} onOpenChange={onOpenChange}>
      <DialogTrigger>Preview</DialogTrigger>
      <DialogContent forceMount aria-label="Preview">
        <button>Content action</button>
      </DialogContent>
    </Dialog>,
    root
  );
  return { openChanges: () => onOpenChange.calls };
}

export function explicitAriaLabelledBy(root: HTMLElement): void {
  mount(
    <>
      <span id="external-dialog-label">External dialog label</span>
      <Dialog defaultOpen>
        <DialogContent aria-labelledby="external-dialog-label">
          Details
        </DialogContent>
      </Dialog>
    </>,
    root
  );
}

export function controlledInput(root: HTMLElement): void {
  function Fixture() {
    const name = state('Ada');

    return (
      <Dialog id="controlled-input-dialog" defaultOpen>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <Input
              aria-label="Name"
              value={name()}
              onInput={(event) =>
                name.set((event.currentTarget as HTMLInputElement).value)
              }
            />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  }

  mount(<Fixture />, root);
}

export function sharedPublicId(root: HTMLElement) {
  function Fixture() {
    return (
      <div>
        <Dialog id="shared" defaultOpen>
          <DialogPortal>
            <DialogContent>First dialog</DialogContent>
          </DialogPortal>
        </Dialog>
        <Dialog id="shared" defaultOpen>
          <DialogPortal>
            <DialogContent>Second dialog</DialogContent>
          </DialogPortal>
        </Dialog>
      </div>
    );
  }

  let container = mount(<Fixture />, root);

  return {
    /** Unmounts the tree and renders the same fixture again. */
    remount: () => {
      unmount(container);
      container = mount(<Fixture />, root);
    },
  };
}

export function triggered(root: HTMLElement): void {
  mount(
    <Dialog>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogPortal>
        <DialogContent>Body</DialogContent>
      </DialogPortal>
    </Dialog>,
    root
  );
}

export function composedButtons(root: HTMLElement): void {
  mount(
    <Dialog>
      <Button asChild variant="outline">
        <DialogTrigger>Open dialog</DialogTrigger>
      </Button>
      <DialogPortal>
        <DialogContent>
          Body
          <Button asChild variant="outline">
            <DialogClose>Close dialog</DialogClose>
          </Button>
        </DialogContent>
      </DialogPortal>
    </Dialog>,
    root
  );
}

export function asChildControls(root: HTMLElement): void {
  mount(
    <Dialog>
      <DialogTrigger asChild>
        <span>Open dialog</span>
      </DialogTrigger>
      <DialogPortal>
        <DialogContent>
          Body
          <DialogClose asChild>
            <span>Close dialog</span>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>,
    root
  );
}

export function labelledWithoutParts(root: HTMLElement): void {
  mount(
    <Dialog defaultOpen>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogPortal>
        <DialogContent aria-label="Preferences">Body</DialogContent>
      </DialogPortal>
    </Dialog>,
    root
  );
}

export function contentOnDismiss(root: HTMLElement) {
  const onDismiss = spy();
  mount(
    <Dialog defaultOpen>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogPortal>
        <DialogContent onDismiss={onDismiss}>Body</DialogContent>
      </DialogPortal>
    </Dialog>,
    root
  );

  return { dismissCount: () => onDismiss.count() };
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
    <Dialog>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogPortal>
        <DialogContent>Body</DialogContent>
      </DialogPortal>
    </Dialog>,
    root
  );
}

export function modalWithOtherFamilies(root: HTMLElement): void {
  mount(
    <ToastHost duration={Number.POSITIVE_INFINITY}>
      <ToastViewport />
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <Select defaultOpen defaultValue="one">
              <SelectTrigger>Choose</SelectTrigger>
              <SelectPortal>
                <SelectContent>
                  <SelectItem value="one">One</SelectItem>
                </SelectContent>
              </SelectPortal>
            </Select>
          </DialogContent>
        </DialogPortal>
      </Dialog>
      <Toast defaultOpen>
        <ToastTitle>Saved</ToastTitle>
      </Toast>
    </ToastHost>,
    root
  );
}

export function nestedDropdown(root: HTMLElement): void {
  mount(
    <Dialog defaultOpen>
      <DialogPortal>
        <DialogContent>
          <Dropdown>
            <DropdownTrigger>Workspace actions</DropdownTrigger>
            <DropdownPortal>
              <DropdownContent>
                <DropdownItem>Archive workspace</DropdownItem>
              </DropdownContent>
            </DropdownPortal>
          </Dropdown>
        </DialogContent>
      </DialogPortal>
    </Dialog>,
    root
  );
}

export function laterDialogOverSelect(root: HTMLElement): void {
  function Fixture() {
    const secondOpen = state(false);

    return (
      <>
        <Dialog id="first-dialog" defaultOpen>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              First dialog
              <Select
                open
                defaultValue="one"
                onValueChange={() => secondOpen.set(true)}
              >
                <SelectTrigger>Choose</SelectTrigger>
                <SelectPortal>
                  <SelectContent>
                    <SelectItem value="one">One</SelectItem>
                    <SelectItem value="two">Open second dialog</SelectItem>
                  </SelectContent>
                </SelectPortal>
              </Select>
            </DialogContent>
          </DialogPortal>
        </Dialog>
        <Dialog id="second-dialog" open={secondOpen()}>
          <DialogPortal>
            <DialogOverlay data-second-overlay="true" />
            <DialogContent>Second dialog</DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  }

  mount(<Fixture />, root);
}
