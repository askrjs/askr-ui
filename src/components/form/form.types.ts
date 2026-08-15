import type { BoxProps } from '../_internal/types';

/** Own props for Form, before merging with native element attributes. */
export type FormOwnProps = {
  children?: unknown;
};

/** Props for Form. */
export type FormProps = BoxProps<'form', HTMLFormElement> & FormOwnProps;

/**
 * `asChild` keeps the form host supplied by the consumer, while retaining the
 * native form attribute contract (method, action, target, encoding, etc.).
 */
export type FormAsChildProps = Omit<
  JSX.IntrinsicElements['form'],
  'children' | 'ref'
> &
  FormOwnProps & {
    asChild: true;
    children: JSX.Element;
    ref?: import('@askrjs/askr/foundations/utilities').Ref<Element>;
  };
