import { defineScope, readScope } from '@askrjs/askr';
import type { getCompositeCollection } from '../_internal/composite';
import type { PendingCollectionFocus } from '../_internal/focus';
import { readVirtualCompositeIdentity } from '../_internal/virtual-composite';
import type { AccordionOrientation } from './accordion.types';

/** Shape of the Accordion Root Context Value. */
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
  pendingFocus: PendingCollectionFocus;
};

/** Shape of the Accordion Render Context Value. */
export type AccordionRenderContextValue = {
  claimItemIndex: () => number;
  virtualIdentity: string | null;
};

/** Shape of the Accordion Item Context Value. */
export type AccordionItemContextValue = {
  accordionId: string;
  itemIndex: number;
  itemSetSize?: number;
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

/**
 * Reads the Accordion Root Context; throws if called outside its provider.
 */
export function readAccordionRootContext(): AccordionRootContextValue {
  const context = readScope(AccordionRootContext);

  if (!context) {
    throw new Error('Accordion components must be used within <Accordion>');
  }

  return context;
}

/**
 * Reads the Accordion Render Context; throws if called outside its provider.
 */
export function readAccordionRenderContext(): AccordionRenderContextValue {
  const context = readScope(AccordionRenderContext);

  if (!context) {
    throw new Error('AccordionItem must be used within <Accordion>');
  }

  return context;
}

/**
 * Reads the Accordion Item Context; throws if called outside its provider.
 */
export function readAccordionItemContext(): AccordionItemContextValue {
  const context = readScope(AccordionItemContext);

  if (!context) {
    throw new Error('Accordion parts must be used within <AccordionItem>');
  }

  return context;
}

/**
 * Creates a fresh Accordion Render Context instance.
 */
export function createAccordionRenderContext(): AccordionRenderContextValue {
  let nextItemIndex = 0;

  return {
    virtualIdentity: readVirtualCompositeIdentity(),
    claimItemIndex: () => {
      const index = nextItemIndex;
      nextItemIndex += 1;
      return index;
    },
  };
}
