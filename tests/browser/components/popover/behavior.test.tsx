import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../../../src/components/popover';
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTrigger,
} from '../../../../src/components/dialog';
import { OverlayHost } from '../../../../src/components/overlay-host';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Popover - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    vi.restoreAllMocks();
    unmount(container);
  });

  it('should toggle trigger expansion state through the trigger', async () => {
    container = mount(
      <Popover>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Details</PopoverContent>
      </Popover>
    );

    let trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLElement;
    trigger.click();
    await flushUpdates();
    trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLElement;

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    trigger.click();
    await flushUpdates();
    trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('should apply trigger-based dialog labeling by default', async () => {
    container = mount(
      <Popover defaultOpen>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Details</PopoverContent>
      </Popover>
    );

    await flushUpdates();

    const trigger = container.querySelector('[aria-haspopup="dialog"]');
    const content = document.body.querySelector(
      '[role="dialog"]'
    ) as HTMLElement | null;

    expect(trigger).toBeTruthy();
    expect(content).toBeTruthy();
    expect(document.body.querySelectorAll('[data-slot="popover-content"]')).toHaveLength(1);
    expect(trigger?.id).toBeTruthy();
    expect(content?.getAttribute('aria-labelledby')).toBe(trigger?.id);
  });

  it('should open and close through asChild Enter and Space presses', async () => {
    container = mount(
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
      </Popover>
    );

    let trigger = container.querySelector(
      '[data-slot="popover-trigger"]'
    ) as HTMLElement;
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await flushUpdates();
    await flushUpdates();

    trigger = container.querySelector(
      '[data-slot="popover-trigger"]'
    ) as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const close = document.body.querySelector(
      '[data-slot="popover-close"]'
    ) as HTMLElement;
    close.focus();
    await userEvent.keyboard(' ');
    await flushUpdates();
    await flushUpdates();

    expect(
      document.body.querySelector('[data-slot="popover-content"]')
    ).toBeNull();
  });

  it('should portal outside transformed clipping ancestors and restore focus', async () => {
    container = mount(
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
      </OverlayHost>
    );

    const trigger = container.querySelector(
      '[data-slot="popover-trigger"]'
    ) as HTMLElement;
    trigger.focus();
    trigger.click();
    await flushUpdates();
    await flushUpdates();

    const clippingAncestor = container.querySelector(
      '[data-testid="clipping-ancestor"]'
    ) as HTMLElement;
    const content = document.body.querySelector(
      '[data-slot="popover-content"]'
    ) as HTMLElement;

    expect(content).toBeTruthy();
    expect(clippingAncestor.contains(content)).toBe(false);

    await userEvent.keyboard('{Escape}');
    await flushUpdates();
    await flushUpdates();

    expect(
      document.body.querySelector('[data-slot="popover-content"]')
    ).toBeNull();
    expect(document.activeElement).toBe(trigger);

    trigger.click();
    await flushUpdates();
    await flushUpdates();
    expect(
      clippingAncestor.contains(document.body.querySelector('[role="dialog"]'))
    ).toBe(false);
  });

  it('should map typed width affordance to a stable data attribute', async () => {
    container = mount(
      <Popover defaultOpen>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent width="md">Details</PopoverContent>
      </Popover>
    );

    await flushUpdates();

    const content = document.body.querySelector(
      '[data-slot="popover-content"]'
    ) as HTMLElement | null;

    expect(content?.getAttribute('data-width')).toBe('md');
  });

  it('should preserve explicit aria-label over automatic trigger labeling', async () => {
    container = mount(
      <Popover defaultOpen>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent aria-label="Popover details">Details</PopoverContent>
      </Popover>
    );

    await flushUpdates();

    const content = document.body.querySelector(
      '[role="dialog"]'
    ) as HTMLElement | null;

    expect(content).toBeTruthy();
    expect(content?.getAttribute('aria-label')).toBe('Popover details');
    expect(content?.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('should keep custom content positioning through the post-open portal sync', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      (callback: FrameRequestCallback) => {
        callback(0);
        return 0;
      }
    );
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function getBoundingClientRect(this: HTMLElement): DOMRect {
        const slot = this.getAttribute('data-slot');

        if (slot === 'popover-trigger') {
          return {
            x: 100,
            y: 100,
            width: 40,
            height: 20,
            top: 100,
            right: 140,
            bottom: 120,
            left: 100,
            toJSON: () => ({}),
          } as DOMRect;
        }

        if (slot === 'popover-content') {
          return {
            x: 0,
            y: 0,
            width: 60,
            height: 30,
            top: 0,
            right: 60,
            bottom: 30,
            left: 0,
            toJSON: () => ({}),
          } as DOMRect;
        }

        return {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          toJSON: () => ({}),
        } as DOMRect;
      }
    );

    container = mount(
      <Popover>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent side="right" align="end" sideOffset={8}>
            Details
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    );

    const trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLElement;
    trigger.click();
    await flushUpdates();

    const content = container.querySelector('[data-slot="popover-content"]');

    expect(content?.getAttribute('data-side')).toBe('right');
    expect(content?.dataset.side).toBe('right');
    expect((content as HTMLElement | null)?.getAttribute('style')).toBeNull();
    expect(getComputedStyle(content as Element).left).toBe('148px');
    expect(getComputedStyle(content as Element).top).toBe('90px');
  });

  it('should mirror start and end alignment for identical RTL trigger geometry', async () => {
    container = mount(
      <>
        <div dir="ltr">
          <Popover defaultOpen>
            <PopoverTrigger
              data-testid="ltr-start-trigger"
              style={{
                position: 'fixed',
                left: '300px',
                top: '80px',
                boxSizing: 'border-box',
                width: '80px',
                height: '20px',
              }}
            >
              LTR start
            </PopoverTrigger>
            <PopoverContent
              data-testid="ltr-start"
              align="start"
              style={{
                boxSizing: 'border-box',
                width: '120px',
                height: '30px',
              }}
            >
              Details
            </PopoverContent>
          </Popover>
        </div>
        <div dir="ltr">
          <Popover defaultOpen>
            <PopoverTrigger
              data-testid="ltr-end-trigger"
              style={{
                position: 'fixed',
                left: '300px',
                top: '160px',
                boxSizing: 'border-box',
                width: '80px',
                height: '20px',
              }}
            >
              LTR end
            </PopoverTrigger>
            <PopoverContent
              data-testid="ltr-end"
              align="end"
              style={{
                boxSizing: 'border-box',
                width: '120px',
                height: '30px',
              }}
            >
              Details
            </PopoverContent>
          </Popover>
        </div>
        <div dir="rtl">
          <Popover defaultOpen>
            <PopoverTrigger
              data-testid="rtl-start-trigger"
              style={{
                position: 'fixed',
                left: '300px',
                top: '240px',
                boxSizing: 'border-box',
                width: '80px',
                height: '20px',
              }}
            >
              RTL start
            </PopoverTrigger>
            <PopoverContent
              data-testid="rtl-start"
              align="start"
              style={{
                boxSizing: 'border-box',
                width: '120px',
                height: '30px',
              }}
            >
              Details
            </PopoverContent>
          </Popover>
        </div>
        <div dir="rtl">
          <Popover defaultOpen>
            <PopoverTrigger
              data-testid="rtl-end-trigger"
              style={{
                position: 'fixed',
                left: '300px',
                top: '320px',
                boxSizing: 'border-box',
                width: '80px',
                height: '20px',
              }}
            >
              RTL end
            </PopoverTrigger>
            <PopoverContent
              data-testid="rtl-end"
              align="end"
              style={{
                boxSizing: 'border-box',
                width: '120px',
                height: '30px',
              }}
            >
              Details
            </PopoverContent>
          </Popover>
        </div>
      </>
    );

    await flushUpdates();
    await flushUpdates();

    const ltrStart = (
      document.body.querySelector('[data-testid="ltr-start"]') as HTMLElement
    ).getBoundingClientRect();
    const ltrEnd = (
      document.body.querySelector('[data-testid="ltr-end"]') as HTMLElement
    ).getBoundingClientRect();
    const rtlStart = (
      document.body.querySelector('[data-testid="rtl-start"]') as HTMLElement
    ).getBoundingClientRect();
    const rtlEnd = (
      document.body.querySelector('[data-testid="rtl-end"]') as HTMLElement
    ).getBoundingClientRect();
    const ltrTrigger = (
      container.querySelector(
        '[data-testid="ltr-start-trigger"]'
      ) as HTMLElement
    ).getBoundingClientRect();
    const rtlTrigger = (
      container.querySelector(
        '[data-testid="rtl-start-trigger"]'
      ) as HTMLElement
    ).getBoundingClientRect();

    expect(rtlTrigger.left).toBeCloseTo(ltrTrigger.left, 0);
    expect(rtlTrigger.right).toBeCloseTo(ltrTrigger.right, 0);
    expect(rtlTrigger.width).toBeCloseTo(ltrTrigger.width, 0);
    expect(ltrStart.left).toBeCloseTo(rtlEnd.left, 0);
    expect(ltrEnd.left).toBeCloseTo(rtlStart.left, 0);
    expect(ltrStart.left).toBeGreaterThan(ltrEnd.left);
  });

  it('should expose the position-only clamp boundary for oversized content', async () => {
    container = mount(
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
      </div>
    );

    await flushUpdates();
    await flushUpdates();

    const content = document.body.querySelector(
      '[data-testid="oversized-content"]'
    ) as HTMLElement;
    const rect = content.getBoundingClientRect();

    expect(rect.width).toBeGreaterThan(window.innerWidth);
    expect(rect.left).toBeGreaterThanOrEqual(12);
    expect(rect.right).toBeGreaterThan(window.innerWidth);
    expect(
      getComputedStyle(content)
        .getPropertyValue('--ak-overlay-available-width')
        .trim()
    ).toBe(`${window.innerWidth - 24}px`);
  });

  it('should close nested popover without closing parent dialog on Escape', async () => {
    container = mount(
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
      </Dialog>
    );

    await flushUpdates();

    const popoverContent = document.body.querySelector(
      '[data-slot="popover-content"]'
    ) as HTMLElement;

    popoverContent.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    await flushUpdates();

    const dialogTrigger = container.querySelector(
      '[data-slot="dialog-trigger"]'
    ) as HTMLElement;
    const popoverTrigger = document.body.querySelector(
      '[data-slot="popover-trigger"]'
    ) as HTMLElement;

    expect(popoverTrigger.getAttribute('aria-expanded')).toBe('false');
    expect(dialogTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(
      document.body.querySelector('[data-slot="dialog-content"]')
    ).not.toBeNull();
  });
});
