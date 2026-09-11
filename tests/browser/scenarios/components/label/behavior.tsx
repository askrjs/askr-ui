import { Label } from '../../../../../src/components/label/label';
import { mount } from '../../_mount';

export function nativeDefault(root: HTMLElement): void {
  mount(<Label htmlFor="email">Email</Label>, root);
}

export function asChildComposition(root: HTMLElement): void {
  mount(
    <Label asChild data-testid="email-label" data-from-label="yes">
      <span data-from-child="yes">Email</span>
    </Label>,
    root
  );
}
