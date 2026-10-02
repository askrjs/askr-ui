import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { flush, mount, type RenderResult } from '@askrjs/askr/testing';
import { renderToStringSync } from '@askrjs/askr/ssr';
import { syncIdAssociation } from '../../../../src/components/_internal/id-association';
import { DismissableLayer } from '../../../../src/components/dismissable-layer';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../../src/components/hover-card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../src/components/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../../src/components/tooltip';
import {
  AlertDialog,
  AlertDialogContent,
} from '../../../../src/components/alert-dialog';

const views: RenderResult[] = [];
async function settle() {
  for (let index = 0; index < 6; index += 1) {
    await Promise.resolve();
    flush();
  }
}
afterEach(async () => {
  for (const view of views.splice(0)) view.unmount();
  await settle();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('overlay committed inputs', () => {
  it('should request a single controlled hover-card close for content Escape', async () => {
    const close = vi.fn();
    const view = mount(() => (
      <HoverCard open onOpenChange={close}>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    ));
    views.push(view);
    await settle();
    view.container
      .querySelector('[data-slot="hover-card-content"]')!
      .dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        })
      );
    expect(close.mock.calls).toEqual([[false]]);
  });

  it.each([false, true])(
    'should compose a custom alert dismissal with caller Escape cancellation=%s',
    async (cancel) => {
      const close = vi.fn();
      const dismiss = vi.fn();
      views.push(
        mount(() => (
          <AlertDialog open onOpenChange={close}>
            <AlertDialogContent
              onDismiss={dismiss}
              onEscapeKeyDown={(event) => {
                if (cancel) event.preventDefault();
              }}
            >
              Confirmation
            </AlertDialogContent>
          </AlertDialog>
        ))
      );
      await settle();
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        })
      );
      expect(close).toHaveBeenCalledTimes(cancel ? 0 : 1);
      expect(dismiss).toHaveBeenCalledTimes(cancel ? 0 : 1);
    }
  );

  it('should retain committed callbacks when an asChild layer replaces its host node', async () => {
    let replacement!: ReturnType<typeof state<boolean>>;
    const calls: string[] = [];
    const view = mount(() => {
      replacement = state(false);
      const next = replacement();
      return (
        <DismissableLayer
          asChild
          onDismiss={() => calls.push(next ? 'replacement' : 'original')}
        >
          {next ? <section>Replacement</section> : <div>Original</div>}
        </DismissableLayer>
      );
    });
    views.push(view);
    await settle();
    replacement.set(true);
    await settle();
    expect(view.container.querySelector('section')).not.toBeNull();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })
    );
    expect(calls).toEqual(['replacement']);
  });

  it('should dismiss the top layer independently in each owner document', async () => {
    const firstDismiss = vi.fn();
    const secondDismiss = vi.fn();
    const otherDocument =
      document.implementation.createHTMLDocument('Second document');
    const otherContainer = otherDocument.createElement('div');
    otherDocument.body.append(otherContainer);
    views.push(
      mount(() => (
        <DismissableLayer onDismiss={firstDismiss}>
          First layer
        </DismissableLayer>
      ))
    );
    views.push(
      mount(
        () => (
          <DismissableLayer onDismiss={secondDismiss}>
            Second layer
          </DismissableLayer>
        ),
        { container: otherContainer }
      )
    );
    await settle();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })
    );
    expect(firstDismiss).toHaveBeenCalledOnce();
    expect(secondDismiss).not.toHaveBeenCalled();
    otherDocument.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })
    );
    expect(secondDismiss).toHaveBeenCalledOnce();
  });

  it.each(['tooltip', 'hover-card'] as const)(
    'should keep closed force-mounted %s content out of the active layer stack',
    async (family) => {
      const dismiss = vi.fn();
      const view = mount(() => (
        <>
          <DismissableLayer onDismiss={dismiss}>Active layer</DismissableLayer>
          {family === 'tooltip' ? (
            <Tooltip open={false}>
              <TooltipContent forceMount>Closed</TooltipContent>
            </Tooltip>
          ) : (
            <HoverCard open={false}>
              <HoverCardContent forceMount>Closed</HoverCardContent>
            </HoverCard>
          )}
        </>
      ));
      views.push(view);
      await settle();
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        })
      );
      expect(dismiss).toHaveBeenCalledOnce();
    }
  );

  it('should avoid attaching hover-card browser listeners during SSR with a document present', () => {
    const listener = vi.spyOn(document, 'addEventListener');
    const html = renderToStringSync(() => (
      <HoverCard>
        <HoverCardTrigger>Preview</HoverCardTrigger>
      </HoverCard>
    ));
    expect(html).toContain('Preview');
    expect(
      listener.mock.calls.filter(([event]) => event === 'pointerover')
    ).toHaveLength(0);
  });

  it('should retain the committed hover-card close delay after a rejected structural update', async () => {
    let rejected!: ReturnType<typeof state<boolean>>;
    const close = vi.fn();
    const view = mount(() => {
      rejected = state(false);
      return (
        <>
          <HoverCard
            open
            closeDelay={rejected() ? 0 : 60_000}
            onOpenChange={close}
          >
            <HoverCardTrigger>Preview</HoverCardTrigger>
          </HoverCard>
          {rejected() ? <i>Rejected insertion</i> : null}
        </>
      );
    });
    views.push(view);
    await settle();
    const failure = new Error('forced structural commit failure');
    const insertion = vi
      .spyOn(view.container, 'insertBefore')
      .mockImplementation(() => {
        throw failure;
      });
    rejected.set(true);
    expect(() => flush()).toThrow(failure);
    insertion.mockRestore();
    vi.useFakeTimers();
    document.body.dispatchEvent(new Event('pointerover', { bubbles: true }));
    vi.advanceTimersByTime(1);
    expect(close).not.toHaveBeenCalled();
    vi.advanceTimersByTime(59_999);
    expect(close).toHaveBeenCalledWith(false);
    rejected.set(false);
    await settle();
  });

  it.each(['callback', 'disabled'] as const)(
    'should retain a committed layer %s after a rejected structural update',
    async (variant) => {
      let rejected!: ReturnType<typeof state<boolean>>;
      const calls: string[] = [];
      const view = mount(() => {
        rejected = state(false);
        const discarded = rejected();
        return [
          <DismissableLayer
            disabled={variant === 'disabled' && discarded}
            onDismiss={() => calls.push(discarded ? 'discarded' : 'committed')}
          >
            Layer
          </DismissableLayer>,
          discarded ? <i>Rejected insertion</i> : null,
        ];
      });
      views.push(view);
      await settle();
      const before = view.container.innerHTML;
      const failure = new Error('forced structural commit failure');
      const insertion = vi
        .spyOn(view.container, 'insertBefore')
        .mockImplementation(() => {
          throw failure;
        });
      rejected.set(true);
      expect(() => flush()).toThrow(failure);
      insertion.mockRestore();
      expect(view.container.innerHTML).toBe(before);
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        })
      );
      expect(calls).toEqual(['committed']);
      rejected.set(false);
      await settle();
    }
  );

  it('should preserve layer order when the lower layer receives new callbacks', async () => {
    let revision!: ReturnType<typeof state<number>>;
    const calls: string[] = [];
    const view = mount(() => {
      revision = state(0);
      const current = revision();
      return (
        <>
          <DismissableLayer onDismiss={() => calls.push(`lower:${current}`)}>
            Lower
          </DismissableLayer>
          <DismissableLayer onDismiss={() => calls.push('upper')}>
            Upper
          </DismissableLayer>
        </>
      );
    });
    views.push(view);
    await settle();
    revision.set(1);
    await settle();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })
    );
    expect(calls).toEqual(['upper']);
  });
});

describe('popover part identity associations', () => {
  it.each(['trigger', 'content'] as const)(
    'should associate actual custom %s IDs in committed markup',
    async (part) => {
      const view = mount(() => (
        <Popover defaultOpen>
          <PopoverTrigger
            id={part === 'trigger' ? 'custom-popover-trigger' : undefined}
          >
            Preview
          </PopoverTrigger>
          <PopoverContent
            id={part === 'content' ? 'custom-popover-content' : undefined}
          >
            Details
          </PopoverContent>
        </Popover>
      ));
      views.push(view);
      await settle();
      const trigger = view.container.querySelector(
        '[data-slot="popover-trigger"]'
      )!;
      const content = view.container.querySelector(
        '[data-slot="popover-content"]'
      )!;
      expect(trigger.getAttribute('aria-controls')).toBe(content.id);
      expect(content.getAttribute('aria-labelledby')).toBe(trigger.id);
    }
  );
});

describe('hover and tooltip part identity associations', () => {
  it.each(['hover-trigger', 'hover-content', 'tooltip-content'] as const)(
    'should associate actual native IDs for %s',
    async (part) => {
      const view = mount(() =>
        part === 'tooltip-content' ? (
          <Tooltip open>
            <TooltipTrigger>Preview</TooltipTrigger>
            <TooltipContent id="caller-tooltip-content">Details</TooltipContent>
          </Tooltip>
        ) : (
          <HoverCard open>
            <HoverCardTrigger
              id={part === 'hover-trigger' ? 'caller-hover-trigger' : undefined}
            >
              Preview
            </HoverCardTrigger>
            <HoverCardContent
              id={part === 'hover-content' ? 'caller-hover-content' : undefined}
            >
              Details
            </HoverCardContent>
          </HoverCard>
        )
      );
      views.push(view);
      await settle();
      if (part === 'tooltip-content') {
        const trigger = view.container.querySelector(
          '[data-slot="tooltip-trigger"]'
        )!;
        const content = view.container.querySelector(
          '[data-slot="tooltip-content"]'
        )!;
        expect(trigger.getAttribute('aria-describedby')).toBe(content.id);
      } else {
        const trigger = view.container.querySelector(
          '[data-slot="hover-card-trigger"]'
        )!;
        const content = view.container.querySelector(
          '[data-slot="hover-card-content"]'
        )!;
        expect(trigger.getAttribute('aria-controls')).toBe(content.id);
        expect(content.getAttribute('aria-labelledby')).toBe(trigger.id);
      }
    }
  );
});

it.each([false, true])(
  'should omit automatic ID references for absent or empty target IDs, empty=%s',
  (empty) => {
    const source = document.createElement('button');
    const target = document.createElement('div');
    source.setAttribute('aria-controls', 'old-target');
    if (empty) target.id = '';
    syncIdAssociation(source, target, 'aria-controls', true);
    expect(source.hasAttribute('aria-controls')).toBe(false);
    source.setAttribute('aria-controls', 'caller-target');
    syncIdAssociation(source, target, 'aria-controls', false);
    expect(source.getAttribute('aria-controls')).toBe('caller-target');
  }
);
