import { VisuallyHidden } from '../../../../../src/components/visually-hidden/visually-hidden';
import { mount } from '../../_mount';

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
