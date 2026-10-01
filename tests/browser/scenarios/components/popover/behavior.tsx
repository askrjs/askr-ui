import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTrigger,
} from '../../../../../src/components/dialog';
import { OverlayHost } from '../../../../../src/components/overlay-host';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../../../../src/components/popover';
import { flushUpdates, mount, spy } from '../../_mount';
import { state } from '@askrjs/askr';

export function forceMountedToggle(root: HTMLElement): void {
  function Fixture() {
    const open = state(false);
    return (
      <Popover open={open()} onOpenChange={open.set}>
        <PopoverTrigger tabIndex={0}>Preview</PopoverTrigger>
        <PopoverContent forceMount>
          <button tabIndex={0}>Content action</button>
        </PopoverContent>
      </Popover>
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
    <Popover open={false} onOpenChange={onOpenChange}>
      <PopoverTrigger>Preview</PopoverTrigger>
      <PopoverContent forceMount>
        <button>Content action</button>
      </PopoverContent>
    </Popover>,
    root
  );
  return { openChanges: () => onOpenChange.calls };
}

export function triggered(root: HTMLElement): void {
  mount(
    <Popover>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent>Details</PopoverContent>
    </Popover>,
    root
  );
}

export function defaultOpen(root: HTMLElement): void {
  mount(
    <Popover defaultOpen>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent>Details</PopoverContent>
    </Popover>,
    root
  );
}

export function asChildControls(root: HTMLElement): void {
  mount(
    <Popover>
      <PopoverTrigger asChild>
        <span>Open popover</span>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent>
          Details
          <PopoverClose asChild>
            <span>Close popover</span>
          </PopoverClose>
        </PopoverContent>
      </PopoverPortal>
    </Popover>,
    root
  );
}

export function clippingAncestor(root: HTMLElement) {
  mount(
    <OverlayHost>
      <div
        data-testid="clipping-ancestor"
        style={{
          width: '120px',
          height: '48px',
          overflow: 'hidden',
          transform: 'translateZ(0)',
        }}
      >
        <Popover>
          <PopoverTrigger>Inspect row</PopoverTrigger>
          <PopoverPortal>
            <PopoverContent style={{ width: '240px', height: '120px' }}>
              Row details
            </PopoverContent>
          </PopoverPortal>
        </Popover>
      </div>
    </OverlayHost>,
    root
  );

  const ancestor = () =>
    root.querySelector('[data-testid="clipping-ancestor"]') as HTMLElement;

  return {
    ancestorContainsContent: () =>
      ancestor().contains(
        document.body.querySelector('[data-slot="popover-content"]')
      ),
    ancestorContainsDialog: () =>
      ancestor().contains(document.body.querySelector('[role="dialog"]')),
  };
}

export function typedWidth(root: HTMLElement): void {
  mount(
    <Popover defaultOpen>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent width="md">Details</PopoverContent>
    </Popover>,
    root
  );
}

export function explicitAriaLabel(root: HTMLElement): void {
  mount(
    <Popover defaultOpen>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent aria-label="Popover details">Details</PopoverContent>
    </Popover>,
    root
  );
}

/**
 * Pins the trigger to a 40x20 box at (100, 100) and sizes the content to
 * 60x30 from a stylesheet, so the content keeps no inline `style` attribute.
 */
export function customPositioning(root: HTMLElement): void {
  const style = document.createElement('style');
  style.textContent = `
    [data-slot="popover-trigger"] {
      position: fixed;
      left: 100px;
      top: 100px;
      box-sizing: border-box;
      width: 40px;
      height: 20px;
      margin: 0;
      padding: 0;
      border: 0;
    }
    [data-slot="popover-content"] {
      box-sizing: border-box;
      width: 60px;
      height: 30px;
      overflow: hidden;
    }
  `;
  root.append(style);
  mount(
    <Popover>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent side="right" align="end" sideOffset={8}>
          Details
        </PopoverContent>
      </PopoverPortal>
    </Popover>,
    root
  );
}

const TRIGGER_BOX = {
  position: 'fixed',
  left: '300px',
  boxSizing: 'border-box',
  width: '80px',
  height: '20px',
} as const;

const CONTENT_BOX = {
  boxSizing: 'border-box',
  width: '120px',
  height: '30px',
} as const;

export function rtlAlignment(root: HTMLElement): void {
  mount(
    <>
      <div dir="ltr">
        <Popover defaultOpen>
          <PopoverTrigger
            data-testid="ltr-start-trigger"
            style={{ ...TRIGGER_BOX, top: '80px' }}
          >
            LTR start
          </PopoverTrigger>
          <PopoverContent
            data-testid="ltr-start"
            align="start"
            style={CONTENT_BOX}
          >
            Details
          </PopoverContent>
        </Popover>
      </div>
      <div dir="ltr">
        <Popover defaultOpen>
          <PopoverTrigger
            data-testid="ltr-end-trigger"
            style={{ ...TRIGGER_BOX, top: '160px' }}
          >
            LTR end
          </PopoverTrigger>
          <PopoverContent data-testid="ltr-end" align="end" style={CONTENT_BOX}>
            Details
          </PopoverContent>
        </Popover>
      </div>
      <div dir="rtl">
        <Popover defaultOpen>
          <PopoverTrigger
            data-testid="rtl-start-trigger"
            style={{ ...TRIGGER_BOX, top: '240px' }}
          >
            RTL start
          </PopoverTrigger>
          <PopoverContent
            data-testid="rtl-start"
            align="start"
            style={CONTENT_BOX}
          >
            Details
          </PopoverContent>
        </Popover>
      </div>
      <div dir="rtl">
        <Popover defaultOpen>
          <PopoverTrigger
            data-testid="rtl-end-trigger"
            style={{ ...TRIGGER_BOX, top: '320px' }}
          >
            RTL end
          </PopoverTrigger>
          <PopoverContent data-testid="rtl-end" align="end" style={CONTENT_BOX}>
            Details
          </PopoverContent>
        </Popover>
      </div>
    </>,
    root
  );
}

export function oversizedContent(root: HTMLElement) {
  mount(
    <div style={{ position: 'fixed', left: '120px', top: '80px' }}>
      <Popover defaultOpen>
        <PopoverTrigger>Open oversized popover</PopoverTrigger>
        <PopoverContent
          data-testid="oversized-content"
          style={{ whiteSpace: 'nowrap' }}
        >
          {'W'.repeat(400)}
        </PopoverContent>
      </Popover>
    </div>,
    root
  );

  return {
    innerWidth: () => window.innerWidth,
  };
}

export function nestedInDialog(root: HTMLElement): void {
  mount(
    <Dialog defaultOpen>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogPortal>
        <DialogContent>
          <Popover defaultOpen>
            <PopoverTrigger>Open popover</PopoverTrigger>
            <PopoverContent>Details</PopoverContent>
          </Popover>
        </DialogContent>
      </DialogPortal>
    </Dialog>,
    root
  );
}

export function partIdentityAssociations(
  root: HTMLElement,
  options?: { part?: 'trigger' | 'content'; callerAria?: boolean } | null
): void {
  mount(
    <Popover defaultOpen>
      <PopoverTrigger
        id={
          options?.part === 'trigger' || options?.callerAria
            ? 'custom-popover-trigger'
            : undefined
        }
        aria-controls={
          options?.callerAria ? 'caller-popover-target' : undefined
        }
      >
        Preview
      </PopoverTrigger>
      <PopoverContent
        id={
          options?.part === 'content' || options?.callerAria
            ? 'custom-popover-content'
            : undefined
        }
        aria-labelledby={
          options?.callerAria ? 'caller-popover-label' : undefined
        }
      >
        Details
      </PopoverContent>
    </Popover>,
    root
  );
}

export function reactivePartIdentityAssociations(
  root: HTMLElement,
  options?: { callerAria?: boolean } | null
) {
  let suffix!: ReturnType<typeof state<string>>;
  let triggerReads = 0;
  let contentReads = 0;
  function Fixture() {
    suffix = state('initial');
    return (
      <Popover defaultOpen>
        <PopoverTrigger
          id={() => {
            triggerReads++;
            return `reactive-popover-trigger-${suffix()}`;
          }}
          aria-controls={
            options?.callerAria ? 'caller-popover-target' : undefined
          }
        >
          Preview
        </PopoverTrigger>
        <PopoverContent
          id={() => {
            contentReads++;
            return `reactive-popover-content-${suffix()}`;
          }}
          aria-labelledby={
            options?.callerAria ? 'caller-popover-label' : undefined
          }
        >
          Details
        </PopoverContent>
      </Popover>
    );
  }
  mount(<Fixture />, root);
  return {
    reads: () => ({ trigger: triggerReads, content: contentReads }),
    update: async () => {
      suffix.set('updated');
      await flushUpdates();
    },
  };
}
