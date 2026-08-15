import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxAsChildProps,
  BoxProps,
} from '../_internal/types';

/** Accordion Orientation. */
export type AccordionOrientation = 'vertical' | 'horizontal';

type AccordionSharedOwnProps = {
  /** Supports literal, nested, array-mapped, and `For`-rendered descendants. */
  children?: unknown;
  id?: string;
  orientation?: AccordionOrientation;
  loop?: boolean;
  collapsible?: boolean;
};

/** Props for Accordion Single. */
export type AccordionSingleProps = BoxProps<'div', HTMLDivElement> &
  AccordionSharedOwnProps & {
    type?: 'single';
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  };

/** Props for Accordion Multiple. */
export type AccordionMultipleProps = BoxProps<'div', HTMLDivElement> &
  AccordionSharedOwnProps & {
    type: 'multiple';
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
  };

/** Props for Accordion. */
export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

/** Own props for Accordion Item, before merging with native element attributes. */
export type AccordionItemOwnProps = {
  children?: unknown;
  value: string;
  disabled?: boolean;
};

/** Props for Accordion Item. */
export type AccordionItemProps = BoxProps<'div', HTMLDivElement> &
  AccordionItemOwnProps;

/** Props for Accordion Header. */
export type AccordionHeaderProps = BoxProps<'h3', HTMLHeadingElement>;
/** Props for the `asChild` (polymorphic) rendering of Accordion Header. */
export type AccordionHeaderAsChildProps = BoxAsChildProps;

/** Props for Accordion Trigger. */
export type AccordionTriggerProps = ButtonLikeProps<
  'button',
  HTMLButtonElement
>;
/** Props for the `asChild` (polymorphic) rendering of Accordion Trigger. */
export type AccordionTriggerAsChildProps = ButtonLikeAsChildProps;

/** Own props for Accordion Content, before merging with native element attributes. */
export type AccordionContentOwnProps = {
  forceMount?: boolean;
};

/** Props for Accordion Content. */
export type AccordionContentProps = BoxProps<'div', HTMLDivElement> &
  AccordionContentOwnProps;
/** Props for the `asChild` (polymorphic) rendering of Accordion Content. */
export type AccordionContentAsChildProps = BoxAsChildProps &
  AccordionContentOwnProps;
