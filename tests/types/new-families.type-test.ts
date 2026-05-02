import type { JSXElement } from '@askrjs/askr/foundations';
import {
  Form,
  HoverCard,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
  type FormAsChildProps,
  type FormProps,
  type HoverCardContentAsChildProps,
  type HoverCardContentProps,
  type HoverCardProps,
  type HoverCardTriggerAsChildProps,
  type HoverCardTriggerProps,
  type ScrollAreaCornerProps,
  type ScrollAreaProps,
  type ScrollAreaScrollbarProps,
  type ScrollAreaThumbProps,
  type ScrollAreaViewportAsChildProps,
  type ScrollAreaViewportProps,
} from '@askrjs/ui';
import { Form as FormSubpath } from '@askrjs/ui/primitives/form';
import { HoverCard as HoverCardSubpath } from '@askrjs/ui/composites/hover-card';
import { ScrollArea as ScrollAreaSubpath } from '@askrjs/ui/composites/scroll-area';

const slotChild = {} as JSXElement;

const formFromSubpath: typeof Form = FormSubpath;
const hoverCardFromSubpath: typeof HoverCard = HoverCardSubpath;
const scrollAreaFromSubpath: typeof ScrollArea = ScrollAreaSubpath;

const formProps: FormProps = { method: 'post' };
const formAsChildProps: FormAsChildProps = {
  asChild: true,
  children: slotChild,
};

const hoverCardProps: HoverCardProps = { defaultOpen: true };
const hoverCardTriggerProps: HoverCardTriggerProps = { children: 'Preview' };
const hoverCardTriggerAsChildProps: HoverCardTriggerAsChildProps = {
  asChild: true,
  children: slotChild,
};
const hoverCardContentProps: HoverCardContentProps = { side: 'bottom' };
const hoverCardContentAsChildProps: HoverCardContentAsChildProps = {
  asChild: true,
  children: slotChild,
};

const scrollAreaProps: ScrollAreaProps = { children: 'area' };
const scrollAreaViewportProps: ScrollAreaViewportProps = {
  children: 'viewport',
};
const scrollAreaViewportAsChildProps: ScrollAreaViewportAsChildProps = {
  asChild: true,
  children: slotChild,
};
const scrollAreaScrollbarProps: ScrollAreaScrollbarProps = {
  orientation: 'vertical',
};
const scrollAreaThumbProps: ScrollAreaThumbProps = {};
const scrollAreaCornerProps: ScrollAreaCornerProps = {};

void [
  formFromSubpath,
  hoverCardFromSubpath,
  scrollAreaFromSubpath,
  Form,
  HoverCard,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
  formProps,
  formAsChildProps,
  hoverCardProps,
  hoverCardTriggerProps,
  hoverCardTriggerAsChildProps,
  hoverCardContentProps,
  hoverCardContentAsChildProps,
  scrollAreaProps,
  scrollAreaViewportProps,
  scrollAreaViewportAsChildProps,
  scrollAreaScrollbarProps,
  scrollAreaThumbProps,
  scrollAreaCornerProps,
];
