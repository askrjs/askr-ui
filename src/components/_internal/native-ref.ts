import type { Ref } from '@askrjs/askr/foundations/utilities';

/** Returns the native branch ref after its asChild ref has been excluded. */
export function nativeRef<TElement extends Element>(
  props:
    | { asChild?: false; ref?: Ref<TElement> }
    | { asChild: true; ref?: Ref<Element> }
): Ref<TElement> | undefined {
  return props.asChild ? undefined : props.ref;
}
