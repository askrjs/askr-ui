import { Textarea } from '../../../../../src/components/textarea/textarea';
import { deterministicRender } from '../../_mount';

export function nativeMarkup() {
  return {
    renders: () => [
      deterministicRender('native textarea', () => (
        <Textarea rows={4}>Notes</Textarea>
      )),
    ],
  };
}

export function asChildMarkup() {
  return {
    renders: () => [
      deterministicRender('asChild textarea', () => (
        <Textarea asChild>
          <textarea aria-label="Notes">Custom notes</textarea>
        </Textarea>
      )),
    ],
  };
}
