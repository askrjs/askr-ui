import { Label } from '../../../../../src/components/label/label';
import { deterministicRender } from '../../_mount';

export function nativeMarkup() {
  return {
    renders: () => [
      deterministicRender('native label', () => (
        <Label htmlFor="email">Email</Label>
      )),
    ],
  };
}

export function asChildMarkup() {
  return {
    renders: () => [
      deterministicRender('asChild label', () => (
        <Label asChild data-testid="email-label">
          <span>Email</span>
        </Label>
      )),
    ],
  };
}
