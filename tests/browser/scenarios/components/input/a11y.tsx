import { Input } from '../../../../../src/components/input';
import { INPUT_A11Y_CONTRACT } from '../../../../../src/components/input/input.a11y';
import { mount } from '../../_mount';

export function axeNative(root: HTMLElement): void {
  mount(<Input aria-label="Email" type="email" />, root);
}

export function axeAsChild(root: HTMLElement): void {
  mount(
    <Input asChild>
      <input aria-label="Email" type="email" />
    </Input>,
    root
  );
}

export function nativeDisabled(root: HTMLElement) {
  mount(<Input aria-label="Email" disabled />, root);
  return { contract: () => INPUT_A11Y_CONTRACT };
}

export function asChildDisabled(root: HTMLElement) {
  mount(
    <Input asChild disabled>
      <input aria-label="Email" />
    </Input>,
    root
  );
  return { contract: () => INPUT_A11Y_CONTRACT };
}

export function contract() {
  return { contract: () => INPUT_A11Y_CONTRACT };
}
