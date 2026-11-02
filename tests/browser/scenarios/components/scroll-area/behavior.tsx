import {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '../../../../../src/components/scroll-area';
import { mount, spy } from '../../_mount';

export function canonicalHooks(root: HTMLElement): void {
  mount(
    <ScrollArea>
      <ScrollAreaViewport>
        <div style={{ height: '200px' }}>Large content</div>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="vertical">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaCorner />
    </ScrollArea>,
    root
  );
}

export function noInlineViewportStyle(root: HTMLElement) {
  mount(
    <ScrollArea>
      <ScrollAreaViewport
        style={{
          overflowY: 'scroll',
          contain: 'paint',
        }}
      >
        <div>Content</div>
      </ScrollAreaViewport>
    </ScrollArea>,
    root
  );

  return {
    /** Calls the viewport outside a render and returns what it threw. */
    orphanViewportError: () => {
      try {
        ScrollAreaViewport({
          children: <div>Orphan</div>,
        } as never);
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
      return null;
    },
  };
}

export function orientationSemantics(root: HTMLElement): void {
  mount(
    <ScrollArea id="messages">
      <ScrollAreaViewport>Messages</ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="vertical" />
      <ScrollAreaScrollbar orientation="horizontal" />
    </ScrollArea>,
    root
  );
}

export function asChildViewport(root: HTMLElement) {
  const onScroll = spy<[Event]>();
  const ref = { current: null as HTMLDivElement | null };
  const childRef = { current: null as HTMLDivElement | null };
  const container = mount(
    <ScrollArea>
      <ScrollAreaViewport asChild ref={ref} onScroll={onScroll}>
        <div ref={childRef}>Messages</div>
      </ScrollAreaViewport>
    </ScrollArea>,
    root
  );

  return {
    /** Whether the consumer ref holds the rendered viewport element. */
    refIsViewport: () =>
      ref.current !== null &&
      ref.current ===
        container.querySelector('[data-slot="scroll-area-viewport"]'),
    childRefIsViewport: () =>
      childRef.current !== null &&
      childRef.current ===
        container.querySelector('[data-slot="scroll-area-viewport"]'),
    scrollCalls: () => onScroll.count(),
  };
}

export function laterChildResize(root: HTMLElement) {
  const container = mount(
    <>
      <style>
        {`[data-testid="later-child-viewport"] {
          width: 200px;
          height: 100px;
          overflow: scroll;
        }`}
      </style>
      <ScrollArea>
        <ScrollAreaViewport data-testid="later-child-viewport">
          <div style={{ height: '20px' }}>First child</div>
          <div data-testid="later-content-child" style={{ height: '500px' }}>
            Later child
          </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar aria-label="Vertical" />
      </ScrollArea>
    </>,
    root
  );
  return {
    shrinkLaterChild: () => {
      const child = container.querySelector(
        '[data-testid="later-content-child"]'
      ) as HTMLElement | null;
      if (!child) throw new Error('Expected the later content child');
      child.style.height = '10px';
    },
    appendOverflowingChild: () => {
      const viewport = container.querySelector(
        '[data-testid="later-child-viewport"]'
      );
      if (!viewport) throw new Error('Expected the scroll area viewport');
      const child = viewport.ownerDocument.createElement('div');
      child.style.height = '500px';
      child.textContent = 'New overflowing child';
      viewport.appendChild(child);
    },
  };
}

export function semanticOverrides(root: HTMLElement) {
  mount(
    <ScrollArea>
      <ScrollAreaViewport id="custom-viewport" role="main" aria-label="Text">
        Text
      </ScrollAreaViewport>
      <ScrollAreaScrollbar
        orientation="horizontal"
        aria-label="Horizontal"
        role="slider"
        aria-controls="wrong"
        aria-orientation="vertical"
        aria-valuemin="10"
        aria-valuemax="20"
      />
    </ScrollArea>,
    root
  );
}

export function overflowMetrics(root: HTMLElement): void {
  mount(
    <>
      <style>
        {`[data-testid="metrics-viewport"] {
          width: 200px;
          height: 100px;
          overflow: scroll;
        }`}
      </style>
      <ScrollArea id="metrics">
        <ScrollAreaViewport data-testid="metrics-viewport">
          <div style={{ width: '600px', height: '500px' }}>Messages</div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical">
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
        <ScrollAreaScrollbar orientation="horizontal">
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollArea>
    </>,
    root
  );
}

export function rtlScrollbar(
  root: HTMLElement,
  options: { direction?: 'ltr' | 'rtl' } = {}
) {
  mount(
    <ScrollArea>
      <ScrollAreaViewport
        dir={options?.direction ?? 'rtl'}
        aria-label="RTL content"
      >
        <div data-review-wide="true">Wide</div>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="horizontal" aria-label="Horizontal">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>,
    root
  );
}

export function cancelledKeyboard(
  root: HTMLElement,
  options: { cancellation: 'ancestor' | 'caller' }
) {
  mount(
    <>
      <style>{`[data-testid="cancelled-viewport"]{width:200px;height:100px;overflow:scroll}`}</style>
      <ScrollArea>
        <ScrollAreaViewport data-testid="cancelled-viewport">
          <div style={{ height: '500px' }}>Messages</div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar
          orientation="vertical"
          aria-label="Vertical"
          onKeyDown={
            options.cancellation === 'caller'
              ? (event: KeyboardEvent) => event.preventDefault()
              : undefined
          }
        />
      </ScrollArea>
    </>,
    root
  );
}
