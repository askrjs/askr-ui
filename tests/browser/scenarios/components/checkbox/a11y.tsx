import { Checkbox } from '../../../../../src/components/checkbox/checkbox';
import { CHECKBOX_A11Y_CONTRACT } from '../../../../../src/components/checkbox/checkbox.a11y';
import { mount } from '../../_mount';

export function axeLabelledNative(root: HTMLElement): void {
  mount(
    <label>
      Accept terms
      <Checkbox />
    </label>,
    root
  );
}

export function axeLabelledAsChild(root: HTMLElement): void {
  mount(
    <Checkbox asChild>
      <div role="checkbox" aria-label="Accept terms">
        Accept terms
      </div>
    </Checkbox>,
    root
  );
}

export function nativeSemantics(root: HTMLElement): void {
  mount(<Checkbox checked={false} />, root);
}

export function indeterminateAsChild(root: HTMLElement) {
  mount(
    <Checkbox asChild indeterminate>
      <div role="checkbox">Select all</div>
    </Checkbox>,
    root
  );
  return { contract: () => CHECKBOX_A11Y_CONTRACT };
}

export function indeterminateNative(root: HTMLElement): void {
  mount(<Checkbox indeterminate />, root);
}

export function disabledAsChild(root: HTMLElement): void {
  mount(
    <Checkbox asChild disabled>
      <div role="checkbox">Disabled</div>
    </Checkbox>,
    root
  );
}

/** Exposes the published contract object for the documentation assertion. */
export function contract() {
  return { contract: () => CHECKBOX_A11Y_CONTRACT };
}
