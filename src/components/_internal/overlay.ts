import { definePortal } from '@askrjs/askr/foundations/structures';
import {
  dynamicAttributeSelector,
  removeDynamicStyleRule,
  setDynamicStyleRule,
} from './dynamic-style';

export type OverlaySide = 'top' | 'right' | 'bottom' | 'left';
export type OverlayAlign = 'start' | 'center' | 'end';
export type OverlayPortal = {
  (): JSX.Element | null;
  render(props: { children?: unknown }): JSX.Element | null;
};

export const OVERLAY_Z_INDEX = {
  dropdown: 'var(--ak-z-dropdown, 1000)',
  modalBackdrop: 'var(--ak-z-modal-backdrop, 1300)',
  modal: 'var(--ak-z-modal, 1400)',
  popover: 'var(--ak-z-popover, 1500)',
  toast: 'var(--ak-z-toast, 1550)',
  tooltip: 'var(--ak-z-tooltip, 1600)',
} as const;

export type OverlayZIndex =
  | number
  | (typeof OVERLAY_Z_INDEX)[keyof typeof OVERLAY_Z_INDEX];

type OverlayNodes = {
  trigger: HTMLElement | null;
  content: HTMLElement | null;
  title?: HTMLElement | null;
  description?: HTMLElement | null;
  cleanup?: () => void;
};

const overlayNodes = new Map<string, OverlayNodes>();
const overlayPortals = new Map<string, OverlayPortal>();

type OverlayPositionMode = 'anchored' | 'centered';

type OverlayPositionOptions = {
  mode?: OverlayPositionMode;
  side?: OverlaySide;
  align?: OverlayAlign;
  sideOffset?: number;
  matchTriggerWidth?: boolean;
  viewportPadding?: number;
  zIndex?: OverlayZIndex;
};

type OverlayPositionDeclarations = Record<string, number | string | undefined>;

function createOverlayPortal(): OverlayPortal {
  return definePortal<unknown>() as OverlayPortal;
}

export function getPersistentPortal(id: string) {
  const existing = overlayPortals.get(id);

  if (existing) {
    return existing;
  }

  const created = createOverlayPortal();
  overlayPortals.set(id, created);
  return created;
}

export function getOverlayNodes(id: string): OverlayNodes {
  const existing = overlayNodes.get(id);

  if (existing) {
    return existing;
  }

  const created: OverlayNodes = {
    trigger: null,
    content: null,
  };

  overlayNodes.set(id, created);
  return created;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function resolveAnchoredSide(
  side: OverlaySide,
  triggerRect: DOMRect,
  contentRect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
  offset: number,
  padding: number
): OverlaySide {
  const available = {
    top: triggerRect.top - padding - offset,
    right: viewportWidth - triggerRect.right - padding - offset,
    bottom: viewportHeight - triggerRect.bottom - padding - offset,
    left: triggerRect.left - padding - offset,
  };

  if (
    side === 'bottom' &&
    available.bottom < contentRect.height &&
    available.top > available.bottom
  ) {
    return 'top';
  }

  if (
    side === 'top' &&
    available.top < contentRect.height &&
    available.bottom > available.top
  ) {
    return 'bottom';
  }

  if (
    side === 'right' &&
    available.right < contentRect.width &&
    available.left > available.right
  ) {
    return 'left';
  }

  if (
    side === 'left' &&
    available.left < contentRect.width &&
    available.right > available.left
  ) {
    return 'right';
  }

  return side;
}

function resolveAlignedOffset(
  align: OverlayAlign,
  start: number,
  end: number,
  size: number
) {
  if (align === 'center') {
    return start + (end - start) / 2 - size / 2;
  }

  if (align === 'end') {
    return end - size;
  }

  return start;
}

function applyAnchoredPosition(
  trigger: HTMLElement,
  content: HTMLElement,
  options: Required<OverlayPositionOptions>
): OverlayPositionDeclarations {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const triggerRect = trigger.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  const contentWidth = options.matchTriggerWidth
    ? Math.max(contentRect.width, triggerRect.width)
    : contentRect.width;
  const resolvedSide = resolveAnchoredSide(
    options.side,
    triggerRect,
    { width: contentWidth, height: contentRect.height } as DOMRect,
    viewportWidth,
    viewportHeight,
    options.sideOffset,
    options.viewportPadding
  );

  let left = 0;
  let top = 0;

  if (resolvedSide === 'top' || resolvedSide === 'bottom') {
    left = resolveAlignedOffset(
      options.align,
      triggerRect.left,
      triggerRect.right,
      contentWidth
    );
    top =
      resolvedSide === 'bottom'
        ? triggerRect.bottom + options.sideOffset
        : triggerRect.top - contentRect.height - options.sideOffset;
  } else {
    top = resolveAlignedOffset(
      options.align,
      triggerRect.top,
      triggerRect.bottom,
      contentRect.height
    );
    left =
      resolvedSide === 'right'
        ? triggerRect.right + options.sideOffset
        : triggerRect.left - contentWidth - options.sideOffset;
  }

  const maxLeft = Math.max(
    options.viewportPadding,
    viewportWidth - contentWidth - options.viewportPadding
  );
  const maxTop = Math.max(
    options.viewportPadding,
    viewportHeight - contentRect.height - options.viewportPadding
  );

  content.dataset.side = resolvedSide;

  return {
    position: 'fixed',
    inset: 'auto',
    margin: '0',
    left: `${Math.round(clamp(left, options.viewportPadding, maxLeft))}px`,
    top: `${Math.round(clamp(top, options.viewportPadding, maxTop))}px`,
    'min-width': options.matchTriggerWidth
      ? `${Math.round(triggerRect.width)}px`
      : undefined,
  };
}

function applyCenteredPosition(
  content: HTMLElement,
  options: Required<OverlayPositionOptions>
): OverlayPositionDeclarations {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const contentRect = content.getBoundingClientRect();
  const maxLeft = Math.max(
    options.viewportPadding,
    viewportWidth - contentRect.width - options.viewportPadding
  );
  const maxTop = Math.max(
    options.viewportPadding,
    viewportHeight - contentRect.height - options.viewportPadding
  );

  return {
    position: 'fixed',
    inset: 'auto',
    margin: '0',
    left: `${Math.round(
      clamp(
        (viewportWidth - contentRect.width) / 2,
        options.viewportPadding,
        maxLeft
      )
    )}px`,
    top: `${Math.round(
      clamp(
        (viewportHeight - contentRect.height) / 2,
        options.viewportPadding,
        maxTop
      )
    )}px`,
  };
}

export function clearOverlayPosition(id: string) {
  const nodes = overlayNodes.get(id);

  if (!nodes?.cleanup) {
    return;
  }

  nodes.cleanup();
  nodes.cleanup = undefined;
}

export function syncOverlayPosition(
  id: string,
  options: OverlayPositionOptions = {}
) {
  if (typeof window === 'undefined') {
    return;
  }

  const nodes = getOverlayNodes(id);
  clearOverlayPosition(id);

  if (!nodes.content) {
    return;
  }

  const mode = options.mode ?? 'anchored';
  const resolvedOptions: Required<OverlayPositionOptions> = {
    mode,
    side: options.side ?? 'bottom',
    align: options.align ?? 'start',
    sideOffset: options.sideOffset ?? 0,
    matchTriggerWidth: options.matchTriggerWidth ?? false,
    viewportPadding: options.viewportPadding ?? 12,
    zIndex:
      options.zIndex ??
      (mode === 'centered' ? OVERLAY_Z_INDEX.modal : OVERLAY_Z_INDEX.popover),
  };

  let frame = 0;
  let resizeObserver: ResizeObserver | null = null;

  const update = () => {
    const { trigger, content } = nodes;

    if (!content) {
      return;
    }

    content.setAttribute('data-askr-overlay-id', id);
    const selector = dynamicAttributeSelector('data-askr-overlay-id', id);

    const position =
      resolvedOptions.mode === 'centered'
        ? applyCenteredPosition(content, resolvedOptions)
        : trigger
          ? applyAnchoredPosition(trigger, content, resolvedOptions)
          : null;

    if (position) {
      setDynamicStyleRule(`overlay:${id}`, selector, {
        ...position,
        'z-index': resolvedOptions.zIndex,
      });
    }
  };

  const scheduleUpdate = () => {
    if (frame) {
      cancelAnimationFrame(frame);
    }

    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };

  scheduleUpdate();
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('scroll', scheduleUpdate, true);

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      scheduleUpdate();
    });

    if (nodes.trigger) {
      resizeObserver.observe(nodes.trigger);
    }

    resizeObserver.observe(nodes.content);
  }

  nodes.cleanup = () => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }

    window.removeEventListener('resize', scheduleUpdate);
    window.removeEventListener('scroll', scheduleUpdate, true);
    resizeObserver?.disconnect();
    resizeObserver = null;
    nodes.content?.removeAttribute('data-askr-overlay-id');
    removeDynamicStyleRule(`overlay:${id}`);
  };
}
