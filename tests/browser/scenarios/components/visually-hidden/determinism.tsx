import { VisuallyHidden } from '../../../../../src/components/visually-hidden/visually-hidden';
import { deterministicRender } from '../../_mount';

export function visuallyHiddenMarkup() {
  return {
    renders: () => [
      deterministicRender('visually hidden text', () => (
        <VisuallyHidden>Hidden text</VisuallyHidden>
      )),
      deterministicRender('visually hidden asChild', () => (
        <VisuallyHidden asChild>
          <strong>Hidden</strong>
        </VisuallyHidden>
      )),
    ],
  };
}
