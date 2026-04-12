import { defineContext, readContext } from '@askrjs/askr';

export type RadioGroupItemMetadata = {
  value: string;
  disabled: boolean;
};

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

export type RadioGroupRenderContextValue = {
  claimItemIndex: () => number;
};

export const RadioGroupRootContext =
  defineContext<RadioGroupRootContextValue | null>(null);
export const RadioGroupRenderContext =
  defineContext<RadioGroupRenderContextValue | null>(null);

export function readRadioGroupRootContext(): RadioGroupRootContextValue {
  const context = readContext(RadioGroupRootContext);

  if (!context) {
    throw new Error('RadioGroupItem must be used within <RadioGroup>');
  }

  return context;
}

export function readRadioGroupRenderContext(): RadioGroupRenderContextValue {
  const context = readContext(RadioGroupRenderContext);

  if (!context) {
    throw new Error('RadioGroupItem must be used within <RadioGroup>');
  }

  return context;
}

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