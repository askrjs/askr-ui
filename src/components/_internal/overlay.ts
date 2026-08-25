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
export type OverlayIdentity = object;

export const OVERLAY_Z_INDEX = {
  dropdown:
    'max(var(--ak-z-dropdown, 1000), calc(var(--ak-z-modal, 1400) + 1))',
  modalBackdrop: 'var(--ak-z-modal-backdrop, 1300)',
  modal: 'var(--ak-z-modal, 1400)',
  popover: 'var(--ak-z-popover, 1500)',
  toast: 'var(--ak-z-toast, 1550)',
  tooltip: 'var(--ak-z-tooltip, 1600)',
} as const;

export type OverlayZIndex =
  | number
  | (typeof OVERLAY_Z_INDEX)[keyof typeof OVERLAY_Z_INDEX];

type OverlayStackEntry = {
  active: boolean;
  order: number;
};

const overlayStackEntries = new WeakMap<OverlayIdentity, OverlayStackEntry>();
const overlayStackSignals = new WeakMap<OverlayIdentity, AbortSignal>();
let nextOverlayStackOrder = 0;
let activeOverlayStackEntries = 0;

function deactivateOverlayStackEntry(identity: OverlayIdentity) {
  const entry = overlayStackEntries.get(identity);
  if (!entry?.active) return;
  entry.active = false;
  activeOverlayStackEntries = Math.max(0, activeOverlayStackEntries - 1);
  if (activeOverlayStackEntries === 0) nextOverlayStackOrder = 0;
}

export function setOverlayStackActive(
  identity: OverlayIdentity,
  active: boolean,
  signal?: AbortSignal
) {
  const entry = overlayStackEntries.get(identity) ?? {
    active: false,
    order: 0,
  };

  if (active && !entry.active) {
    nextOverlayStackOrder += 1;
    entry.order = nextOverlayStackOrder;
    entry.active = true;
    activeOverlayStackEntries += 1;
  }
  overlayStackEntries.set(identity, entry);

  if (!active) {
    deactivateOverlayStackEntry(identity);
  }

  if (signal && overlayStackSignals.get(identity) !== signal) {
    overlayStackSignals.set(identity, signal);
    signal.addEventListener(
      'abort',
      () => {
        if (overlayStackSignals.get(identity) === signal) {
          deactivateOverlayStackEntry(identity);
          removeDynamicStyleRule(`${overlayStyleKey(identity)}:stack:backdrop`);
        }
      },
      { once: true }
    );
  }
}

export function resolveOverlayStackZIndex(
  identity: OverlayIdentity,
  requested: OverlayZIndex,
  layer: 'backdrop' | 'content' = 'content'
): string {
  const order = overlayStackEntries.get(identity)?.order ?? 0;
  const offset = order * 2 + (layer === 'content' ? 1 : 0);
  const fallback =
    typeof requested === 'number' ? Math.max(requested, 1600) : 1600;
  return `calc(var(--ak-z-overlay-stack-base, var(--ak-z-tooltip, ${fallback})) + ${offset})`;
}

type OverlayNodes = {
  trigger: HTMLElement | null;
  content: HTMLElement | null;
  title?: HTMLElement | null;
  description?: HTMLElement | null;
  cleanup?: () => void;
};

export type OverlayNodePart = 'trigger' | 'content' | 'title' | 'description';

const overlayNodes = new WeakMap<OverlayIdentity, OverlayNodes>();
const overlayNodeOwners = new WeakMap<
  OverlayIdentity,
  Partial<Record<OverlayNodePart, object>>
>();
const overlayNonces = new WeakMap<OverlayIdentity, string | undefined>();

export function captureOverlayNonce(
  identity: OverlayIdentity,
  nonce: string | undefined
) {
  overlayNonces.set(identity, nonce);
}
const overlayPortals = new WeakMap<OverlayIdentity, OverlayPortal>();
const overlayStyleKeys = new WeakMap<OverlayIdentity, string>();
let nextOverlayStyleKey = 0;

export function createOverlayIdentity(): OverlayIdentity {
  return {};
}

function overlayStyleKey(identity: OverlayIdentity): string {
  const existing = overlayStyleKeys.get(identity);
  if (existing) return existing;
  const created = `overlay:${nextOverlayStyleKey++}`;
  overlayStyleKeys.set(identity, created);
  return created;
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

function createOverlayPortal(): OverlayPortal {
  return definePortal() as OverlayPortal;
}

export function getPersistentPortal(identity: OverlayIdentity) {
  const existing = overlayPortals.get(identity);

  if (existing) {
    return existing;
  }

  const created = createOverlayPortal();
  overlayPortals.set(identity, created);
  return created;
}

export function getOverlayNodes(identity: OverlayIdentity): OverlayNodes {
  const existing = overlayNodes.get(identity);

  if (existing) {
    return existing;
  }

  const created: OverlayNodes = {
    trigger: null,
    content: null,
  };

  overlayNodes.set(identity, created);
  return created;
}

export function registerOverlayNode(
  identity: OverlayIdentity,
  part: OverlayNodePart,
  node: HTMLElement | null,
  owner: object
) {
  const nodes = getOverlayNodes(identity);
  const owners = overlayNodeOwners.get(identity) ?? {};

  if (node) {
    owners[part] = owner;
    nodes[part] = node;
  } else if (owners[part] === owner) {
    delete owners[part];
    nodes[part] = null;
  }

  overlayNodeOwners.set(identity, owners);
}

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
    overlayNonces.get(identity)
  );
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
    overlayNonces.get(identity)
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
        overlayNonces.get(identity)
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
