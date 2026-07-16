import { defineScope, readScope } from '@askrjs/askr';

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
  defineScope<RadioGroupRootContextValue | null>(null);
export const RadioGroupRenderContext =
  defineScope<RadioGroupRenderContextValue | null>(null);

export function readRadioGroupRootContext(): RadioGroupRootContextValue {
  const context = readScope(RadioGroupRootContext);

  if (!context) {
    throw new Error('RadioGroupItem must be used within <RadioGroup>');
  }

  return context;
}

export function readRadioGroupRenderContext(): RadioGroupRenderContextValue {
  const context = readScope(RadioGroupRenderContext);

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
