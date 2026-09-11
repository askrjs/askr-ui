import type { Collection } from '@askrjs/askr/foundations/structures';
import { scrollVirtualCompositeToIndex } from '../virtual-composite';

export function focusSelectedCollectionItem<
  TMetadata extends { index: number },
>(
  collection: Collection<HTMLElement, TMetadata>,
  index: number,
  preventScroll = false
): boolean {
  const match = collection
    .items()
    .find((item) => item.metadata.index === index)?.node;

  if (!match) {
    return false;
  }

  match.focus({ preventScroll });
  return true;
}

export type PendingCollectionFocus = {
  index: number | null;
};

type OpenAutoFocusClaim = {
  open: boolean;
  node: HTMLElement | null;
};

const openAutoFocusClaims = new WeakMap<object, OpenAutoFocusClaim>();

export function claimOpenAutoFocus(
  identity: object,
  open: boolean,
  node: HTMLElement | null
): node is HTMLElement {
  const claim = openAutoFocusClaims.get(identity) ?? {
    open: false,
    node: null,
  };

  if (!open) {
    claim.open = false;
    claim.node = null;
    openAutoFocusClaims.set(identity, claim);
    return false;
  }

  if (!node) {
    return false;
  }

  if (claim.open && claim.node === node) {
    return false;
  }

  claim.open = true;
  claim.node = node;
  openAutoFocusClaims.set(identity, claim);
  return true;
}

export function focusCollectionItemWithRestore<
  TMetadata extends { index: number },
>(
  pendingFocus: PendingCollectionFocus,
  collection: Collection<HTMLElement, TMetadata>,
  index: number,
  resolveNode?: () => HTMLElement | null
) {
  const resolveFocusNode = () =>
    resolveNode?.() ??
    collection.items().find((item) => item.metadata.index === index)?.node ??
    null;
  const focusItem = (preventScroll = false) => {
    const resolvedNode = resolveFocusNode();

    if (resolvedNode) {
      resolvedNode.focus({ preventScroll });
      return true;
    }

    return false;
  };
  const settleFocus = (attemptsRemaining: number) => {
    const schedule =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (callback: FrameRequestCallback) => setTimeout(callback, 0);
    schedule(() => {
      if (pendingFocus.index !== index) return;
      const target = resolveFocusNode();
      const active =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      if (
        active &&
        active !== document.body &&
        active !== target &&
        !target?.contains(active)
      ) {
        pendingFocus.index = null;
        return;
      }
      if (focusItem(true)) {
        pendingFocus.index = null;
        return;
      }
      if (attemptsRemaining > 1) {
        settleFocus(attemptsRemaining - 1);
      } else {
        pendingFocus.index = null;
      }
    });
  };

  pendingFocus.index = index;
  if (focusItem()) {
    settleFocus(3);
    return;
  }
  scrollVirtualCompositeToIndex(index);
  queueMicrotask(() => {
    queueMicrotask(() => {
      if (pendingFocus.index === index) focusItem(true);
    });
  });
  settleFocus(3);
}

export function restorePendingCollectionItemFocus(
  pendingFocus: PendingCollectionFocus,
  index: number,
  node: HTMLElement | null
) {
  if (node && pendingFocus.index === index) {
    if (node.isConnected) {
      node.focus({ preventScroll: true });
    } else {
      queueMicrotask(() => {
        if (
          pendingFocus.index === index &&
          node.isConnected &&
          document.activeElement === document.body
        ) {
          node.focus({ preventScroll: true });
        }
      });
    }
  }
}

export type CompositeItemFocusTracker = {
  disabled: boolean;
  focused: boolean;
  repairQueued: boolean;
};

const compositeItemFocusTrackers = new WeakMap<
  HTMLElement,
  CompositeItemFocusTracker
>();

export function getCompositeItemFocusTracker(
  node: HTMLElement
): CompositeItemFocusTracker {
  const existing = compositeItemFocusTrackers.get(node);

  if (existing) {
    return existing;
  }

  const created = {
    disabled: false,
    focused: false,
    repairQueued: false,
  };
  compositeItemFocusTrackers.set(node, created);
  return created;
}

export function compositeItemFocusProps(): {
  onBlur: (event: FocusEvent) => void;
  onFocus: (event: FocusEvent) => void;
} {
  return {
    onFocus: (event) => {
      if (event.currentTarget instanceof HTMLElement) {
        getCompositeItemFocusTracker(event.currentTarget).focused = true;
      }
    },
    onBlur: (event) => {
      const currentTarget = event.currentTarget;
      if (!(currentTarget instanceof HTMLElement)) {
        return;
      }
      const tracker = getCompositeItemFocusTracker(currentTarget);
      if (event.relatedTarget instanceof HTMLElement) {
        tracker.focused = false;
        return;
      }

      queueMicrotask(() => {
        const disabledDuringBlur =
          currentTarget instanceof HTMLElement &&
          (currentTarget.hasAttribute('disabled') ||
            currentTarget.getAttribute('aria-disabled') === 'true');

        if (!disabledDuringBlur) {
          tracker.focused = false;
        }
      });
    },
  };
}
