import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

/** Own props for Dismissable Layer, before merging with native element attributes. */
export type DismissableLayerOwnProps = {
  children?: unknown;
  id?: string;
  disabled?: boolean;
  disableOutsidePointerEvents?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onInteractOutside?: (event: Event) => void;
  onDismiss?: () => void;
};

/** Props for Dismissable Layer. */
export type DismissableLayerProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'ref'
> &
  DismissableLayerOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

/** Props for the `asChild` (polymorphic) rendering of Dismissable Layer. */
export type DismissableLayerAsChildProps = DismissableLayerOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<Element>;
};
