import { defineContext, readContext } from '@askrjs/askr';

export type ToggleGroupItemMetadata = {
  value: string;
  disabled: boolean;
};

export type ToggleGroupRootContextValue = {
  groupId: string;
  type: 'single' | 'multiple';
  value: string | string[];
  setValue: (value: string | string[]) => void;
  orientation: 'horizontal' | 'vertical';
  loop: boolean;
  disabled: boolean;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  items: ToggleGroupItemMetadata[];
};

export type ToggleGroupRenderContextValue = {
  claimItemIndex: () => number;
};

export const ToggleGroupRootContext =
  defineContext<ToggleGroupRootContextValue | null>(null);
export const ToggleGroupRenderContext =
  defineContext<ToggleGroupRenderContextValue | null>(null);

export function readToggleGroupRootContext(): ToggleGroupRootContextValue {
  const context = readContext(ToggleGroupRootContext);

  if (!context) {
    throw new Error('ToggleGroupItem must be used within <ToggleGroup>');
  }

  return context;
}

export function readToggleGroupRenderContext(): ToggleGroupRenderContextValue {
  const context = readContext(ToggleGroupRenderContext);

  if (!context) {
    throw new Error('ToggleGroupItem must be used within <ToggleGroup>');
  }

  return context;
}

export function createToggleGroupRenderContext(): ToggleGroupRenderContextValue {
  let nextItemIndex = 0;

  return {
    claimItemIndex: () => {
      const index = nextItemIndex;
      nextItemIndex += 1;
      return index;
    },
  };
}