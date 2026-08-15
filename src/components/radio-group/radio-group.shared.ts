import { defineScope, readScope } from '@askrjs/askr';

/** Radio Group Item Metadata. */
export type RadioGroupItemMetadata = {
  value: string;
  disabled: boolean;
};

/** Shape of the Radio Group Root Context Value. */
export type RadioGroupRootContextValue = {
  groupId: string;
  value: string;
  setValue: (value: string) => void;
  notifyItemsChanged: () => void;
  scheduleItemsSync: () => void;
  orientation: 'horizontal' | 'vertical' | 'both';
  loop: boolean;
  disabled: boolean;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  items: RadioGroupItemMetadata[];
};

/** Shape of the Radio Group Render Context Value. */
export type RadioGroupRenderContextValue = {
  claimItemIndex: () => number;
};

export const RadioGroupRootContext =
  defineScope<RadioGroupRootContextValue | null>(null);
export const RadioGroupRenderContext =
  defineScope<RadioGroupRenderContextValue | null>(null);

/**
 * Reads the Radio Group Root Context; throws if called outside its provider.
 */
export function readRadioGroupRootContext(): RadioGroupRootContextValue {
  const context = readScope(RadioGroupRootContext);

  if (!context) {
    throw new Error('RadioGroupItem must be used within <RadioGroup>');
  }

  return context;
}

/**
 * Reads the Radio Group Render Context; throws if called outside its provider.
 */
export function readRadioGroupRenderContext(): RadioGroupRenderContextValue {
  const context = readScope(RadioGroupRenderContext);

  if (!context) {
    throw new Error('RadioGroupItem must be used within <RadioGroup>');
  }

  return context;
}

/**
 * Creates a fresh Radio Group Render Context instance.
 */
export function createRadioGroupRenderContext(): RadioGroupRenderContextValue {
  let nextItemIndex = 0;

  return {
    claimItemIndex: () => {
      const index = nextItemIndex;
      nextItemIndex += 1;
      return index;
    },
  };
}
