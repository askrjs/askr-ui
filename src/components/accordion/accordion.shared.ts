import { defineScope, readScope } from '@askrjs/askr';
import type { getCompositeCollection } from '../_internal/composite';
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
  defineScope<AccordionRootContextValue | null>(null);
export const AccordionRenderContext =
  defineScope<AccordionRenderContextValue | null>(null);
export const AccordionItemContext =
  defineScope<AccordionItemContextValue | null>(null);

export function readAccordionRootContext(): AccordionRootContextValue {
  const context = readScope(AccordionRootContext);

  if (!context) {
    throw new Error('Accordion components must be used within <Accordion>');
  }

  return context;
}

export function readAccordionRenderContext(): AccordionRenderContextValue {
  const context = readScope(AccordionRenderContext);

  if (!context) {
    throw new Error('AccordionItem must be used within <Accordion>');
  }

  return context;
}

export function readAccordionItemContext(): AccordionItemContextValue {
  const context = readScope(AccordionItemContext);

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
