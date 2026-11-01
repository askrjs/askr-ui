import { VisuallyHidden } from '../../../../../src/components/visually-hidden/visually-hidden';
import { mount, unmount } from '../../_mount';

export function hiddenSpanDefault(root: HTMLElement): void {
  mount(<VisuallyHidden>Hidden text</VisuallyHidden>, root);
}

export function asChildComposition(root: HTMLElement): void {
  mount(
    <VisuallyHidden asChild>
      <strong>Hidden</strong>
    </VisuallyHidden>,
    root
  );
}

export function asChildRefs(root: HTMLElement) {
  let componentRef: Element | null = null;
  let hostRef: HTMLElement | null = null;
  let omittedComponentHostRef: HTMLElement | null = null;
  const first = mount(
    <VisuallyHidden asChild ref={(node) => (componentRef = node)}>
      <strong ref={(node) => (hostRef = node)}>Hidden</strong>
    </VisuallyHidden>,
    root
  );
  const host = first.querySelector('[data-askr-visually-hidden="true"]');
  const componentMatches = componentRef === host;
  const hostMatches = hostRef === host;

  unmount(first);
  const second = mount(
    <VisuallyHidden asChild>
      <strong ref={(node) => (omittedComponentHostRef = node)}>
        More hidden
      </strong>
    </VisuallyHidden>,
    root
  );
  const omittedComponentHostMatches =
    omittedComponentHostRef ===
    second.querySelector('[data-askr-visually-hidden="true"]');

  return {
    refs: () => ({
      componentMatches,
      hostMatches,
      omittedComponentHostMatches,
    }),
  };
}
