import { Slot, createLayer } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { getSignal, state } from '@askrjs/askr';
import { resolveCompoundId } from '../_internal/id';
import type {
  DismissableLayerAsChildProps,
  DismissableLayerProps,
} from './dismissable-layer.types';

type LayerEntry = {
  node: HTMLElement | null;
  unregister: (() => void) | null;
  unregisterDocumentListeners: (() => void) | null;
  isTop: (() => boolean) | null;
  setNode: (node: HTMLElement | null) => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  handlePointerDownCapture: (event: PointerEvent) => void;
  lastEscapeEvent: KeyboardEvent | null;
  lastOutsidePointerEvent: PointerEvent | null;
  disabled: boolean;
  disableOutsidePointerEvents: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onInteractOutside?: (event: Event) => void;
  onDismiss?: () => void;
  cleanupSignal: AbortSignal | null;
};

const layerManager = createLayer();
const layerEntries = new Map<object, LayerEntry>();

function getLayerEntry(identity: object): LayerEntry {
  const existing = layerEntries.get(identity);

  if (existing) {
    return existing;
  }

  const created: LayerEntry = {
    node: null,
    unregister: null,
    isTop: null,
    setNode: (node: HTMLElement | null) => {
      if (created.node === node) {
        return;
      }

      unregisterLayer(created);

      if (!node) {
        return;
      }

      created.node = node;
      const layer = layerManager.register({
        node,
      });
      const ownerDocument = node.ownerDocument;
      const handleDocumentKeyDown = (event: KeyboardEvent) => {
        created.handleKeyDown(event);
      };
      const handleDocumentPointerDown = (event: PointerEvent) => {
        created.handlePointerDownCapture(event);
      };

      ownerDocument.addEventListener('keydown', handleDocumentKeyDown, true);
      ownerDocument.addEventListener(
        'pointerdown',
        handleDocumentPointerDown,
        true
      );
      created.unregister = () => {
        layer.unregister();
      };
      created.unregisterDocumentListeners = () => {
        ownerDocument.removeEventListener(
          'keydown',
          handleDocumentKeyDown,
          true
        );
        ownerDocument.removeEventListener(
          'pointerdown',
          handleDocumentPointerDown,
          true
        );
      };
      created.isTop = () => layer.isTop();
    },
    handleKeyDown: (event: KeyboardEvent) => {
      if (created.disabled) {
        return;
      }

      if (event.key !== 'Escape') {
        return;
      }

      if (created.lastEscapeEvent === event) {
        return;
      }
      created.lastEscapeEvent = event;
      runDismissCallbacks(created, 'escape');
    },
    handlePointerDownCapture: (event: PointerEvent) => {
      if (created.disabled) {
        return;
      }

      if (!(event.target instanceof Node)) {
        return;
      }

      if (!created.node || created.node.contains(event.target)) {
        return;
      }

      created.lastOutsidePointerEvent = event;
      runDismissCallbacks(created, 'outside');
    },
    lastEscapeEvent: null,
    lastOutsidePointerEvent: null,
    unregisterDocumentListeners: null,
    disabled: false,
    disableOutsidePointerEvents: false,
    cleanupSignal: null,
  };

  layerEntries.set(identity, created);
  return created;
}

function registerLayerCleanup(identity: object, entry: LayerEntry) {
  const signal = getSignal();
  if (entry.cleanupSignal === signal) {
    return;
  }
  entry.cleanupSignal = signal;
  signal.addEventListener(
    'abort',
    () => {
      if (entry.cleanupSignal !== signal) {
        return;
      }
      unregisterLayer(entry);
      layerEntries.delete(identity);
    },
    { once: true }
  );
}

/**
 * Renders a part of `dismissable-layer`.
 */
export function dismissableLayerEntryCountForTests(): number {
  return layerEntries.size;
}

function unregisterLayer(entry: LayerEntry) {
  if (!entry.unregister) {
    return;
  }

  entry.unregister();
  entry.unregisterDocumentListeners?.();
  entry.unregister = null;
  entry.unregisterDocumentListeners = null;
  entry.isTop = null;
  entry.node = null;
}

function runDismissCallbacks(entry: LayerEntry, trigger: 'escape' | 'outside') {
  if (entry.disabled || !entry.isTop?.()) {
    return;
  }

  if (trigger === 'escape') {
    const escapeEvent =
      entry.lastEscapeEvent ??
      new KeyboardEvent('keydown', { cancelable: true, key: 'Escape' });

    entry.onEscapeKeyDown?.(escapeEvent);

    if (escapeEvent.defaultPrevented) {
      return;
    }

    escapeEvent.preventDefault?.();
    entry.onDismiss?.();
    return;
  }

  const pointerEvent =
    entry.lastOutsidePointerEvent ??
    new PointerEvent('pointerdown', { bubbles: true, cancelable: true });

  entry.onPointerDownOutside?.(pointerEvent);

  if (pointerEvent.defaultPrevented) {
    return;
  }

  entry.onInteractOutside?.(pointerEvent);

  if (pointerEvent.defaultPrevented) {
    return;
  }

  if (entry.disableOutsidePointerEvents) {
    pointerEvent.preventDefault?.();
    pointerEvent.stopPropagation?.();
  }

  entry.onDismiss?.();
}

/**
 * Renders a part of `dismissable-layer`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function DismissableLayer(props: DismissableLayerProps): JSX.Element;
export function DismissableLayer(
  props: DismissableLayerAsChildProps
): JSX.Element;
export function DismissableLayer(
  props: DismissableLayerProps | DismissableLayerAsChildProps
) {
  const {
    asChild,
    children,
    id,
    disabled = false,
    disableOutsidePointerEvents = false,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    onDismiss,
    ref,
    ...rest
  } = props;

  const identity = state<object>({
    id: resolveCompoundId('dismissable-layer', id, children),
  })();
  const entry = getLayerEntry(identity);
  registerLayerCleanup(identity, entry);
  entry.disabled = disabled;
  entry.disableOutsidePointerEvents = disableOutsidePointerEvents;
  entry.onEscapeKeyDown = onEscapeKeyDown;
  entry.onPointerDownOutside = onPointerDownOutside;
  entry.onInteractOutside = onInteractOutside;
  entry.onDismiss = onDismiss;

  const refHandler = ref
    ? composeRefs(
        ref as
          | ((value: HTMLElement | null) => void)
          | { current: HTMLElement | null }
          | null
          | undefined,
        entry.setNode
      )
    : entry.setNode;

  const finalProps = mergeProps(rest, {
    ref: refHandler,
    'data-dismissable-layer': 'true',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
