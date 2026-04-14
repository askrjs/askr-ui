import { defineContext, readContext } from '@askrjs/askr';
import type { getCompositeCollection } from '../../_internal/composite';
import type { AccordionOrientation } from './accordion.types';

export type AccordionRootContextValue = {
  accordionId: string;
  type: 'single' | 'multiple';
  value: string | string[];
  setValue: (value: string | string[]) => void;
  orientation: AccordionOrientation;
  loop: boolean;
  collapsible: boolean;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  disabledIndexes: number[];
  itemCount: number;
  collection: ReturnType<typeof getCompositeCollection>;
};

export type AccordionRenderContextValue = {
  claimItemIndex: () => number;
};

export type AccordionItemContextValue = {
  accordionId: string;
  itemIndex: number;
  itemValue: string;
  itemDisabled: boolean;
  itemId: string;
  triggerId: string;
  contentId: string;
};

export const AccordionRootContext =
  defineContext<AccordionRootContextValue | null>(null);
export const AccordionRenderContext =
  defineContext<AccordionRenderContextValue | null>(null);
export const AccordionItemContext =
  defineContext<AccordionItemContextValue | null>(null);

export function readAccordionRootContext(): AccordionRootContextValue {
  const context = readContext(AccordionRootContext);

  if (!context) {
    throw new Error('Accordion components must be used within <Accordion>');
  }

  return context;
}

export function readAccordionRenderContext(): AccordionRenderContextValue {
  const context = readContext(AccordionRenderContext);

  if (!context) {
    throw new Error('AccordionItem must be used within <Accordion>');
  }

  return context;
}

export function readAccordionItemContext(): AccordionItemContextValue {
  const context = readContext(AccordionItemContext);

  if (!context) {
    throw new Error('Accordion parts must be used within <AccordionItem>');
  }

  return context;
}

export function createAccordionRenderContext(): AccordionRenderContextValue {
  let nextItemIndex = 0;

  return {
    claimItemIndex: () => {
      const index = nextItemIndex;
      nextItemIndex += 1;
      return index;
    },
  };
}
