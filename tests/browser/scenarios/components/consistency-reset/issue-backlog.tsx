import { state } from '@askrjs/askr';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '../../../../../src/components/dialog';
import { FocusScope } from '../../../../../src/components/focus-scope';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../../src/components/popover';
import { Tooltip, TooltipTrigger } from '../../../../../src/components/tooltip';
import { mount, flushUpdates } from '../../_mount';

export function persistentDialogs(root: HTMLElement) {
  let openFirst!: ReturnType<typeof state<boolean>>;
  let openSecond!: ReturnType<typeof state<boolean>>;
  function Scene() {
    openFirst = state(false);
    openSecond = state(true);
    return (
      <>
        <Dialog id="first" open={openFirst()} onOpenChange={openFirst.set}>
          <DialogTrigger>First</DialogTrigger>
          <DialogContent forceMount>
            <button>First action</button>
          </DialogContent>
        </Dialog>
        <Dialog id="second" open={openSecond()} onOpenChange={openSecond.set}>
          <DialogTrigger>Second</DialogTrigger>
          <DialogContent>
            <button>Second action</button>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  mount(<Scene />, root);
  return {
    openFirst: async () => {
      openFirst.set(true);
      await flushUpdates();
    },
  };
}

export function iframeFocus(
  root: HTMLElement,
  options: { persistent?: boolean } = {}
) {
  const iframe = document.createElement('iframe');
  root.append(iframe);
  const ownerDocument = iframe.contentDocument!;
  const before = ownerDocument.createElement('button');
  before.textContent = 'Before';
  ownerDocument.body.append(before);
  before.focus();
  let open!: ReturnType<typeof state<boolean>>;
  function Scene() {
    open = state(!options.persistent);
    return options.persistent ? (
      <Popover open={open()} onOpenChange={open.set}>
        <PopoverTrigger>Preview</PopoverTrigger>
        <PopoverContent forceMount>
          <button>First</button>
          <button>Last</button>
        </PopoverContent>
      </Popover>
    ) : (
      <>
        {open() ? (
          <FocusScope trapped loop>
            <button>First</button>
            <button>Last</button>
          </FocusScope>
        ) : null}
      </>
    );
  }
  mount(<Scene />, ownerDocument.body);
  return {
    open: async () => {
      open.set(true);
      await flushUpdates();
    },
    close: async () => {
      open.set(false);
      await flushUpdates();
    },
  };
}

export function tooltipListeners(root: HTMLElement) {
  const listeners = new Set<EventListenerOrEventListenerObject>();
  const originalAdd = document.addEventListener;
  const originalRemove = document.removeEventListener;
  document.addEventListener = function (type, callback, options) {
    if (type === 'focusin' && callback) listeners.add(callback);
    return originalAdd.call(this, type, callback, options);
  };
  document.removeEventListener = function (type, callback, options) {
    if (type === 'focusin' && callback) listeners.delete(callback);
    return originalRemove.call(this, type, callback, options);
  };
  let revision!: ReturnType<typeof state<number>>;
  function Scene() {
    revision = state(0);
    return (
      <Tooltip id={`hint-${revision()}`}>
        <TooltipTrigger>Hint</TooltipTrigger>
      </Tooltip>
    );
  }
  mount(<Scene />, root);
  return {
    rerender: async () => {
      revision.set(revision() + 1);
      await flushUpdates();
    },
    listenerCount: () => listeners.size,
    restore: () => {
      document.addEventListener = originalAdd;
      document.removeEventListener = originalRemove;
    },
  };
}
