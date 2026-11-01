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

export function asChildChildRef(root: HTMLElement) {
  const childRef = { current: null as HTMLSpanElement | null };
  const labelRef = { current: null as HTMLSpanElement | null };
  const container = mount(
    <Label asChild ref={labelRef}>
      <span ref={childRef}>Email</span>
    </Label>,
    root
  );
  return {
    refChecks: () => ({
      child: childRef.current === container.querySelector('span'),
      component: labelRef.current === container.querySelector('span'),
    }),
  };
}

export function asChildNativeLabel(root: HTMLElement): void {
  mount(
    <div>
      <Label asChild htmlFor="email">
        <label data-testid="as-child-label">Email</label>
      </Label>
      <input id="email" />
    </div>,
    root
  );
}
