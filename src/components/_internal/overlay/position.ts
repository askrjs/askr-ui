import {
  dynamicAttributeSelector,
  removeDynamicStyleRule,
  setDynamicStyleRule,
} from '../dynamic-style';
import { getOverlayNonce } from './nonce';
import { overlayNodes, getOverlayNodes } from './portal';
import { overlayStyleKey } from './style-key';
import type { OverlayAlign, OverlayIdentity, OverlaySide } from './types';
import { OVERLAY_Z_INDEX, resolveOverlayStackZIndex } from './z-index';
import type { OverlayZIndex } from './z-index';

export function primeOverlayStackNode(
  identity: OverlayIdentity,
  part: 'backdrop',
  domId: string,
  requested: OverlayZIndex
) {
  const attribute = 'data-askr-overlay-stack-id';
  const styleKey = `${overlayStyleKey(identity)}:stack:${part}`;
  setDynamicStyleRule(
    styleKey,
    dynamicAttributeSelector(attribute, domId),
    { 'z-index': resolveOverlayStackZIndex(identity, requested, part) },
    getOverlayNonce(identity)
  );
}

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
  size: number,
  reverse: boolean = false
) {
  if (align === 'center') {
    return start + (end - start) / 2 - size / 2;
  }

  if (align === (reverse ? 'start' : 'end')) {
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
  const availableWidth = Math.max(
    0,
    viewportWidth - options.viewportPadding * 2
  );
  const availableHeight = Math.max(
    0,
    viewportHeight - options.viewportPadding * 2
  );
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
      contentWidth,
      window.getComputedStyle(trigger).direction === 'rtl'
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
    '--ak-overlay-available-width': `${Math.round(availableWidth)}px`,
    '--ak-overlay-available-height': `${Math.round(availableHeight)}px`,
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
  const contentTransform = window.getComputedStyle(content).transform;
  const measureFromLayoutBox = contentTransform !== 'none';
  const contentWidth =
    measureFromLayoutBox && content.offsetWidth
      ? content.offsetWidth
      : contentRect.width;
  const contentHeight =
    measureFromLayoutBox && content.offsetHeight
      ? content.offsetHeight
      : contentRect.height;
  const maxWidth = Math.max(0, viewportWidth - options.viewportPadding * 2);
  const maxHeight = Math.max(0, viewportHeight - options.viewportPadding * 2);
  const maxLeft = Math.max(
    options.viewportPadding,
    viewportWidth - contentWidth - options.viewportPadding
  );
  const maxTop = Math.max(
    options.viewportPadding,
    viewportHeight - contentHeight - options.viewportPadding
  );

  return {
    position: 'fixed',
    inset: 'auto',
    margin: '0',
    '--ak-overlay-available-width': `${Math.round(maxWidth)}px`,
    '--ak-overlay-available-height': `${Math.round(maxHeight)}px`,
    'max-width': `${Math.round(maxWidth)}px`,
    'max-height': `${Math.round(maxHeight)}px`,
    left: `${Math.round(
      clamp(
        (viewportWidth - contentWidth) / 2,
        options.viewportPadding,
        maxLeft
      )
    )}px`,
    top: `${Math.round(
      clamp(
        (viewportHeight - contentHeight) / 2,
        options.viewportPadding,
        maxTop
      )
    )}px`,
  };
}

function clearOverlayPositionEffects(identity: OverlayIdentity) {
  const nodes = overlayNodes.get(identity);

  if (!nodes?.cleanup) {
    return;
  }

  nodes.cleanup();
  nodes.cleanup = undefined;
}

export function clearOverlayPosition(identity: OverlayIdentity) {
  const nodes = overlayNodes.get(identity);
  if (nodes && !nodes.content) {
    queueMicrotask(() => {
      if (!nodes.content) clearOverlayPositionEffects(identity);
    });
    return;
  }
  clearOverlayPositionEffects(identity);
}

export function primeOverlayPosition(
  identity: OverlayIdentity,
  domId: string,
  zIndex: OverlayZIndex
) {
  const resolvedZIndex = resolveOverlayStackZIndex(identity, zIndex);
  setDynamicStyleRule(
    overlayStyleKey(identity),
    dynamicAttributeSelector('data-askr-overlay-id', domId),
    {
      position: 'fixed',
      inset: 'auto',
      margin: '0',
      'z-index': resolvedZIndex,
    },
    getOverlayNonce(identity)
  );
}

export function syncOverlayPosition(
  identity: OverlayIdentity,
  domId: string,
  options: OverlayPositionOptions = {}
) {
  if (typeof window === 'undefined') {
    return;
  }

  const nodes = getOverlayNodes(identity);
  clearOverlayPositionEffects(identity);

  if (!nodes.content) {
    return;
  }
  const positionedContent = nodes.content;
  const selectorAttribute = positionedContent.id
    ? { name: 'id', value: positionedContent.id }
    : { name: 'data-askr-overlay-id', value: domId };
  const selector = dynamicAttributeSelector(
    selectorAttribute.name,
    selectorAttribute.value
  );
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
    const { trigger } = nodes;

    if (nodes.content !== positionedContent) {
      return;
    }

    const content = positionedContent;
    if (selectorAttribute.name === 'data-askr-overlay-id') {
      content.setAttribute(selectorAttribute.name, selectorAttribute.value);
    }

    const position =
      resolvedOptions.mode === 'centered'
        ? applyCenteredPosition(content, resolvedOptions)
        : trigger
          ? applyAnchoredPosition(trigger, content, resolvedOptions)
          : null;

    if (position) {
      setDynamicStyleRule(
        overlayStyleKey(identity),
        selector,
        {
          ...position,
          'z-index': resolveOverlayStackZIndex(
            identity,
            resolvedOptions.zIndex
          ),
        },
        getOverlayNonce(identity)
      );
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

  update();
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

    resizeObserver.observe(positionedContent);
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
    if (selectorAttribute.name === 'data-askr-overlay-id') {
      positionedContent.removeAttribute(selectorAttribute.name);
    }
    removeDynamicStyleRule(overlayStyleKey(identity));
  };
}
