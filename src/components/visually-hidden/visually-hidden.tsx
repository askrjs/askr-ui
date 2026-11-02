import type { JSX } from '@askrjs/askr/jsx-runtime';
import { nativeRef } from '../_internal/native-ref';
import { Slot } from '@askrjs/askr/foundations/structures';
import { cspNonce } from '@askrjs/askr';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import { resolveAsChildRef } from '../_internal/slot-ref';
import { setDynamicStyleRule } from '../_internal/dynamic-style';
import type {
  VisuallyHiddenAsChildProps,
  VisuallyHiddenSpanProps,
} from './visually-hidden.types';

const visuallyHiddenAttrs = {
  'data-askr-visually-hidden': 'true',
} as const;

function ensureVisuallyHiddenRule(nonce: string | undefined) {
  setDynamicStyleRule(
    'visually-hidden',
    '[data-askr-visually-hidden="true"]',
    {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      'white-space': 'nowrap',
      border: '0',
    },
    nonce
  );
}

/**
 * Renders a part of `visually-hidden`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function VisuallyHidden(props: VisuallyHiddenSpanProps): JSX.Element;
export function VisuallyHidden(props: VisuallyHiddenAsChildProps): JSX.Element;
export function VisuallyHidden(
  props: VisuallyHiddenSpanProps | VisuallyHiddenAsChildProps
) {
  const nonce = cspNonce();
  ensureVisuallyHiddenRule(nonce);

  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, visuallyHiddenAttrs);

  if (asChild) {
    const slotRef = resolveAsChildRef(
      children,
      ref as Ref<Element> | undefined
    );

    return (
      <Slot
        asChild
        {...finalProps}
        {...(slotRef === undefined ? {} : { ref: slotRef })}
        children={children}
      />
    );
  }

  return (
    <span {...finalProps} ref={nativeRef<HTMLSpanElement>(props)}>
      {children}
    </span>
  );
}
