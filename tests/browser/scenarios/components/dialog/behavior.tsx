import { state } from '@askrjs/askr';
import { Button } from '../../../../../src/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
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
import { mount, spy, unmount } from '../../_mount';

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
              onInput={(event) => name.set(event.target.value)}
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
