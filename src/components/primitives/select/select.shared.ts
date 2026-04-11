import { defineContext, readContext } from '@askrjs/askr';
import type { OverlayPortal } from '../../_internal/overlay';

export type SelectItemMetadata = {
  disabled: boolean;
  value?: string;
  text: string;
};

export type SelectRootContextValue = {
  selectId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  portal: OverlayPortal;
  value: string;
  setValue: (value: string) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  items: SelectItemMetadata[];
  disabled: boolean;
  selectedText: string;
};

export type SelectRenderContextValue = {
  claimItemIndex: () => number;
  claimGroupIndex: () => number;
};

export type SelectGroupContextValue = {
  groupId: string;
  labelId: string;
};

export const SelectRootContext = defineContext<SelectRootContextValue | null>(
  null
);
export const SelectRenderContext =
  defineContext<SelectRenderContextValue | null>(null);
export const SelectGroupContext = defineContext<SelectGroupContextValue | null>(
  null
);

export function readSelectRootContext(): SelectRootContextValue {
  const context = readContext(SelectRootContext);

  if (!context) {
    throw new Error('Select components must be used within <Select>');
  }

  return context;
}

export function readSelectRenderContext(): SelectRenderContextValue {
  const context = readContext(SelectRenderContext);

  if (!context) {
    throw new Error('Select items and groups must be used within <Select>');
  }

  return context;
}

export function readSelectGroupContext(): SelectGroupContextValue | null {
  return readContext(SelectGroupContext);
}

export function createSelectRenderContext(): SelectRenderContextValue {
  let nextItemIndex = 0;
  let nextGroupIndex = 0;

  return {
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

export function getSelectDisabledIndexes(
  items: SelectItemMetadata[],
  disabled: boolean
): number[] {
  return items
    .map((item, index) => (disabled || item.disabled ? index : -1))
    .filter((index) => index !== -1);
}
