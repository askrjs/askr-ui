import { composeRefs } from '@askrjs/askr/foundations/utilities';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import { isJsxElement } from './jsx';

const composedRefCache = new WeakMap<
  object,
  WeakMap<object, (value: Element | null) => void>
>();

/**
 * Resolves refs for a child host. With no component ref, the child's ref is
 * returned unchanged so Slot does not replace it with an undefined value.
 * The composed callback is cached per ref pair so reactive rerenders do not
 * detach and reattach an unchanged host ref.
 */
export function resolveAsChildRef<T extends Element>(
  children: unknown,
  ref: Ref<T> | undefined
): Ref<T> | undefined {
  const childRef = isJsxElement(children)
    ? (children.props.ref as Ref<T> | undefined)
    : undefined;

  if (ref == null) return childRef;
  if (childRef == null || childRef === ref) return ref;

  let childRefs = composedRefCache.get(ref);
  if (!childRefs) {
    childRefs = new WeakMap();
    composedRefCache.set(ref, childRefs);
  }

  const cachedRef = childRefs.get(childRef);
  if (cachedRef) return cachedRef as Ref<T>;

  const composedRef = composeRefs(ref, childRef);
  childRefs.set(childRef, composedRef as (value: Element | null) => void);
  return composedRef;
}
