import { Textarea } from '../../../../../src/components/textarea/textarea';
import { TEXTAREA_A11Y_CONTRACT } from '../../../../../src/components/textarea/textarea.a11y';
import { mount } from '../../_mount';

export function axeNative(root: HTMLElement): void {
  mount(<Textarea aria-label="Notes" rows={3} />, root);
}

export function axeAsChild(root: HTMLElement): void {
  mount(
    <Textarea asChild>
      <textarea aria-label="Notes" rows={3} />
    </Textarea>,
    root
  );
}

export function nativeDisabled(root: HTMLElement) {
  mount(<Textarea aria-label="Notes" disabled />, root);
  return { contract: () => TEXTAREA_A11Y_CONTRACT };
}

export function asChildDisabled(root: HTMLElement) {
  mount(
    <Textarea asChild disabled>
      <textarea aria-label="Notes" />
    </Textarea>,
    root
  );
  return { contract: () => TEXTAREA_A11Y_CONTRACT };
}

/** Exposes the published contract object for the documentation assertion. */
export function contract(): {
  contract: () => typeof TEXTAREA_A11Y_CONTRACT;
} {
  return { contract: () => TEXTAREA_A11Y_CONTRACT };
}
