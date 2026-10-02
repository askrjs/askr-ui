import { afterEach, expect, it, vi } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { flush, mount, type RenderResult } from '@askrjs/askr/testing';
import { Dialog, DialogOverlay } from '../../../../src/components/dialog';
import { DismissableLayer } from '../../../../src/components/dismissable-layer';
import { FocusScope } from '../../../../src/components/focus-scope';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from '../../../../src/components/dropdown';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '../../../../src/components/select';
import { Tooltip, TooltipTrigger } from '../../../../src/components/tooltip';
import { Popover, PopoverTrigger } from '../../../../src/components/popover';
import {
  HoverCard,
  HoverCardTrigger,
} from '../../../../src/components/hover-card';
import {
  createOverlayIdentity,
  setOverlayStackActive,
  resolveOverlayStackZIndex,
  OVERLAY_Z_INDEX,
} from '../../../../src/components/_internal/overlay';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../src/components/radio-group';

const views: RenderResult[] = [];
const frames: HTMLIFrameElement[] = [];
async function settle() {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
    flush();
  }
}
afterEach(async () => {
  for (const view of views.splice(0)) view.unmount();
  await settle();
  for (const frame of frames.splice(0)) frame.remove();
  vi.restoreAllMocks();
});

it('should give a persistent layer priority when it opens after a later mounted layer', async () => {
  let enabled!: ReturnType<typeof state<boolean>>;
  const calls: string[] = [];
  views.push(
    mount(() => {
      enabled = state(false);
      return (
        <>
          <DismissableLayer
            disabled={!enabled()}
            onDismiss={() => calls.push('persistent')}
          >
            Persistent
          </DismissableLayer>
          <DismissableLayer onDismiss={() => calls.push('later')}>
            Later
          </DismissableLayer>
        </>
      );
    })
  );
  await settle();
  enabled.set(true);
  await settle();
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
  );
  expect(calls).toEqual(['persistent']);
});

it('should remove the focused tooltip listener after rerendering and blurring to the document body', async () => {
  const add = vi.spyOn(document, 'addEventListener');
  const remove = vi.spyOn(document, 'removeEventListener');
  let revision!: ReturnType<typeof state<number>>;
  const view = mount(() => {
    revision = state(0);
    return (
      <>
        <Tooltip id={`hint-${revision()}`}>
          <TooltipTrigger>Hint</TooltipTrigger>
        </Tooltip>
        <button>Outside</button>
      </>
    );
  });
  views.push(view);
  await settle();
  const trigger = () =>
    view.container.querySelector<HTMLElement>('[data-slot="tooltip-trigger"]')!;
  trigger().focus();
  await settle();
  revision.set(1);
  await settle();
  revision.set(2);
  await settle();
  trigger().blur();
  await settle();
  const attached = add.mock.calls
    .filter(([type]) => type === 'focusin')
    .map(([, listener]) => listener);
  const removed = remove.mock.calls
    .filter(([type]) => type === 'focusin')
    .map(([, listener]) => listener);
  expect(attached.length).toBeGreaterThan(0);
  expect(attached.filter((listener) => !removed.includes(listener))).toEqual(
    []
  );
});

it('should register tooltip owner cleanup once across rerenders', async () => {
  const original = AbortSignal.prototype.addEventListener;
  const registrations: EventListenerOrEventListenerObject[] = [];
  vi.spyOn(AbortSignal.prototype, 'addEventListener').mockImplementation(
    function (type, callback, options) {
      if (
        type === 'abort' &&
        new Error().stack?.includes('tooltip-root.tsx') &&
        callback
      )
        registrations.push(callback);
      return original.call(this, type, callback, options);
    }
  );
  let revision!: ReturnType<typeof state<number>>;
  views.push(
    mount(() => {
      revision = state(0);
      return (
        <Tooltip id={`hint-${revision()}`}>
          <TooltipTrigger>Hint</TooltipTrigger>
        </Tooltip>
      );
    })
  );
  await settle();
  const initial = registrations.length;
  revision.set(1);
  await settle();
  revision.set(2);
  await settle();
  expect(registrations).toHaveLength(initial);
});

it('should retain committed backdrop CSS after a rejected dialog ID and open update', async () => {
  let rejected!: ReturnType<typeof state<boolean>>;
  const view = mount(() => {
    rejected = state(false);
    return (
      <>
        <Dialog
          id={rejected() ? 'discarded-dialog' : 'committed-dialog'}
          open={rejected()}
        >
          <DialogOverlay forceMount />
        </Dialog>
        {rejected() ? <i>Rejected insertion</i> : null}
      </>
    );
  });
  views.push(view);
  await settle();
  const styles = () =>
    [...document.querySelectorAll('style[data-askr-dynamic-styles]')]
      .map((node) => node.textContent)
      .join('\n');
  const before = styles();
  const failure = new Error('forced structural failure');
  const insert = vi
    .spyOn(view.container, 'insertBefore')
    .mockImplementation(() => {
      throw failure;
    });
  rejected.set(true);
  expect(() => flush()).toThrow(failure);
  insert.mockRestore();
  expect(styles()).toBe(before);
  rejected.set(false);
  await settle();
});

it('should loop and restore focus in the scope owner document', async () => {
  const frame = document.createElement('iframe');
  frames.push(frame);
  document.body.append(frame);
  const ownerDocument = frame.contentDocument!;
  const before = ownerDocument.createElement('button');
  before.textContent = 'Before';
  ownerDocument.body.append(before);
  before.focus();
  const container = ownerDocument.createElement('div');
  ownerDocument.body.append(container);
  const view = mount(
    () => (
      <FocusScope loop>
        <button>First</button>
        <button>Last</button>
      </FocusScope>
    ),
    { container }
  );
  views.push(view);
  await settle();
  const buttons = container.querySelectorAll<HTMLButtonElement>('button');
  expect(ownerDocument.activeElement).toBe(buttons[0]);
  buttons[1].focus();
  buttons[1].dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
  );
  expect(ownerDocument.activeElement).toBe(buttons[0]);
  view.unmount();
  views.pop();
  await settle();
  expect(ownerDocument.activeElement).toBe(before);
});

it.each(['dropdown', 'select'] as const)(
  'should clear automatic %s controls when content unmounts',
  async (family) => {
    let open!: ReturnType<typeof state<boolean>>;
    const view = mount(() => {
      open = state(true);
      return family === 'dropdown' ? (
        <Dropdown open={open()}>
          <DropdownTrigger>Menu</DropdownTrigger>
          <DropdownContent>
            <DropdownItem>One</DropdownItem>
          </DropdownContent>
        </Dropdown>
      ) : (
        <Select open={open()}>
          <SelectTrigger>Pick</SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>
      );
    });
    views.push(view);
    await settle();
    const trigger = () =>
      view.container.querySelector(`[data-slot="${family}-trigger"]`)!;
    expect(trigger().getAttribute('aria-controls')).toBeTruthy();
    open.set(false);
    await settle();
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
  }
);

it('should reset an unselected radio group to its first enabled tab stop', async () => {
  const view = mount(() => (
    <form>
      <RadioGroup defaultValue="">
        <RadioGroupItem value="a">A</RadioGroupItem>
        <RadioGroupItem value="b">B</RadioGroupItem>
      </RadioGroup>
    </form>
  ));
  views.push(view);
  await settle();
  const radios = () => [
    ...view.container.querySelectorAll<HTMLElement>('[role="radio"]'),
  ];
  radios()[0].focus();
  radios()[0].dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    })
  );
  await settle();
  expect(radios()[1].getAttribute('tabindex')).toBe('0');
  view.container.querySelector('form')!.reset();
  await settle();
  expect(radios().map((node) => node.getAttribute('aria-checked'))).toEqual([
    'false',
    'false',
  ]);
  expect(radios().map((node) => node.getAttribute('tabindex'))).toEqual([
    '0',
    '-1',
  ]);
});

const rootTriggers = [
  [
    'dialog',
    (open: boolean) => (
      <Dialog open={open}>
        <DialogOverlay forceMount />
      </Dialog>
    ),
  ],
  [
    'dropdown',
    (open: boolean) => (
      <Dropdown open={open}>
        <DropdownTrigger>Menu</DropdownTrigger>
      </Dropdown>
    ),
  ],
  [
    'select',
    (open: boolean) => (
      <Select open={open}>
        <SelectTrigger>Pick</SelectTrigger>
      </Select>
    ),
  ],
  [
    'popover',
    (open: boolean) => (
      <Popover open={open}>
        <PopoverTrigger>Preview</PopoverTrigger>
      </Popover>
    ),
  ],
  [
    'hover-card',
    (open: boolean) => (
      <HoverCard open={open}>
        <HoverCardTrigger>Preview</HoverCardTrigger>
      </HoverCard>
    ),
  ],
  [
    'tooltip',
    (open: boolean) => (
      <Tooltip open={open}>
        <TooltipTrigger>Hint</TooltipTrigger>
      </Tooltip>
    ),
  ],
] as const;
it.each(rootTriggers)(
  'should not consume an overlay open order for a rejected %s render',
  async (_family, component) => {
    let rejected!: ReturnType<typeof state<boolean>>;
    const view = mount(() => {
      rejected = state(false);
      return (
        <>
          {component(rejected())}
          {rejected() ? <i>Reject</i> : null}
        </>
      );
    });
    views.push(view);
    await settle();
    const first = createOverlayIdentity();
    const second = createOverlayIdentity();
    const controller = new AbortController();
    const offset = (identity: ReturnType<typeof createOverlayIdentity>) =>
      Number(
        resolveOverlayStackZIndex(identity, OVERLAY_Z_INDEX.modal).match(
          /\+ (\d+)\)$/
        )![1]
      );
    setOverlayStackActive(first, true, controller.signal);
    const before = offset(first);
    const failure = new Error('discard open order');
    const insert = vi
      .spyOn(view.container, 'insertBefore')
      .mockImplementation(() => {
        throw failure;
      });
    try {
      rejected.set(true);
      expect(() => flush()).toThrow(failure);
      insert.mockRestore();
      setOverlayStackActive(second, true, controller.signal);
      expect(offset(second) - before).toBe(2);
    } finally {
      insert.mockRestore();
      controller.abort();
      rejected.set(false);
      await settle();
    }
  }
);
