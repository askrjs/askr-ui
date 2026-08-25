import { defineScope, readScope } from '@askrjs/askr';
import { getMenuCollection, getMenuCollectionItems } from '../_internal/menu';
import type { OverlayPortal } from '../_internal/overlay';
import {
  compositeItemCount,
  disabledCompositeItemIndexes,
  firstEnabledCompositeItemIndex,
  readVirtualCompositeIdentity,
} from '../_internal/virtual-composite';

/** Select State Input. */
export type SelectStateInput = {
  selectId: string;
  value: string;
  open: boolean;
  currentIndexCandidate: number;
  disabled: boolean;
  bindFormReset: (node: Element | null) => void;
  declaredItems: SelectItemMetadata[];
};

/** Select Item Metadata. */
export type SelectItemMetadata = {
  index: number;
  setSize?: number;
  disabled: boolean;
  value?: string;
  text: string;
};

/** Shape of the Select Root Context Value. */
export type SelectRootContextValue = {
  selectId: string;
  overlayIdentity: object;
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  portal: OverlayPortal;
  value: string;
  setValue: (value: string) => void;
  currentIndexCandidate: number;
  setCurrentIndex: (index: number) => void;
  focusItem: (index: number) => void;
  restoreItemFocus: (index: number, node: HTMLElement | null) => void;
  disabled: boolean;
  bindFormReset: (node: Element | null) => void;
  declaredItems: SelectItemMetadata[];
  resolvedState: SelectResolvedState;
  handleTypeaheadKeyDown: (event: KeyboardEvent) => boolean;
  handleTypeaheadKeyUp: (event: KeyboardEvent) => boolean;
};

/** Shape of the Select Render Context Value. */
export type SelectRenderContextValue = {
  claimItemIndex: () => number;
  claimGroupIndex: () => number;
  virtualIdentity: string | null;
};

/** Shape of the Select Group Context Value. */
export type SelectGroupContextValue = {
  groupId: string;
  labelId: string;
};

/** Select Resolved State. */
export type SelectResolvedState = {
  items: SelectItemMetadata[];
  currentIndex: number;
  selectedText: string;
  disabledIndexes: number[];
  itemCount: number;
};

export const SelectRootContext = defineScope<SelectRootContextValue | null>(
  null
);
export const SelectRenderContext = defineScope<SelectRenderContextValue | null>(
  null
);
export const SelectGroupContext = defineScope<SelectGroupContextValue | null>(
  null
);

/**
 * Reads the Select Root Context; throws if called outside its provider.
 */
export function readSelectRootContext(): SelectRootContextValue {
  const context = readScope(SelectRootContext);

  if (!context) {
    throw new Error('Select components must be used within <Select>');
  }

  return context;
}

/**
 * Reads the Select Render Context; throws if called outside its provider.
 */
export function readSelectRenderContext(): SelectRenderContextValue {
  const context = readScope(SelectRenderContext);

  if (!context) {
    throw new Error('Select items and groups must be used within <Select>');
  }

  return context;
}

/**
 * Reads the Select Group Context; throws if called outside its provider.
 */
export function readSelectGroupContext(): SelectGroupContextValue | null {
  return readScope(SelectGroupContext);
}

/**
 * Creates a fresh Select Render Context instance.
 */
export function createSelectRenderContext(): SelectRenderContextValue {
  let nextItemIndex = 0;
  let nextGroupIndex = 0;

  return {
    virtualIdentity: readVirtualCompositeIdentity(),
    claimItemIndex: () => {
      const index = nextItemIndex;
      nextItemIndex += 1;
      return index;
    },
    claimGroupIndex: () => {
      const index = nextGroupIndex;
      nextGroupIndex += 1;
      return index;
    },
  };
}

/**
 * Returns the indexes of disabled items in the collection.
 */
export function getSelectDisabledIndexes(
  items: SelectItemMetadata[],
  disabled: boolean
): number[] {
  return disabledCompositeItemIndexes(
    items.map((item) => ({ ...item, disabled: disabled || item.disabled }))
  );
}

/**
 * Computes the resolved Select State (collection items, current index,
 * and disabled indexes) from root context input.
 */
export function resolveSelectState(
  root: SelectStateInput
): SelectResolvedState {
  const registeredItems = getMenuCollectionItems(
    getMenuCollection(root.selectId)
  ).map((item) => ({
    index: item.index,
    setSize: item.setSize,
    disabled: item.disabled,
    value: item.value,
    text: item.text,
  }));
  const items =
    registeredItems.length > 0 ? registeredItems : root.declaredItems;
  const effectiveItems = items.map((item) => ({
    index: item.index,
    setSize: item.setSize,
    disabled: root.disabled || item.disabled,
  }));
  const selectedIndex = items.find((item) => item.value === root.value)?.index;
  const fallbackIndex = firstEnabledCompositeItemIndex(effectiveItems);
  const itemCount = compositeItemCount(items);
  const allItemsDisabled =
    items.length > 0 &&
    itemCount <= items.length &&
    effectiveItems.every((item) => item.disabled);
  const candidateIndex = root.currentIndexCandidate;
  const candidate = effectiveItems.find(
    (item) => item.index === candidateIndex
  );
  const selected = effectiveItems.find((item) => item.index === selectedIndex);
  const candidateInRange =
    candidateIndex >= 0 && candidateIndex < Math.max(itemCount, 1);
  const candidateEnabled = candidate ? !candidate.disabled : candidateInRange;
  const currentIndex =
    root.open && candidateEnabled
      ? candidateIndex
      : selectedIndex !== undefined && selected && !selected.disabled
        ? selectedIndex
        : candidateEnabled
          ? candidateIndex
          : allItemsDisabled
            ? -1
            : fallbackIndex;

  return {
    items,
    currentIndex,
    selectedText: items.find((item) => item.value === root.value)?.text ?? '',
    disabledIndexes: getSelectDisabledIndexes(items, root.disabled),
    itemCount,
  };
}
