import { Toggle } from '../../../../../src/components/toggle/toggle';
import { TOGGLE_A11Y_CONTRACT } from '../../../../../src/components/toggle/toggle.a11y';
import { mount } from '../../_mount';

export function axeNative(root: HTMLElement): void {
  mount(<Toggle>Mute</Toggle>, root);
}

export function axeAsChild(root: HTMLElement): void {
  mount(
    <Toggle asChild>
      <span>Mute</span>
    </Toggle>,
    root
  );
}

export function nativeSemantics(root: HTMLElement): void {
  mount(<Toggle pressed={false}>Mute</Toggle>, root);
}

export function asChildSemantics(root: HTMLElement) {
  mount(
    <Toggle asChild pressed>
      <span>Mute</span>
    </Toggle>,
    root
  );
  return { contract: () => TOGGLE_A11Y_CONTRACT };
}

export function nativeDisabled(root: HTMLElement): void {
  mount(<Toggle disabled>Mute</Toggle>, root);
}

export function asChildDisabled(root: HTMLElement): void {
  mount(
    <Toggle asChild disabled>
      <span>Mute</span>
    </Toggle>,
    root
  );
}

export function accessibleNaming(root: HTMLElement): void {
  mount(
    <div>
      <span id="toggle-label">Mute audio</span>
      <Toggle aria-labelledby="toggle-label">Mute</Toggle>
    </div>,
    root
  );
}

/** Exposes the published contract object for the documentation assertion. */
export function contract(): {
  contract: () => typeof TOGGLE_A11Y_CONTRACT;
} {
  return { contract: () => TOGGLE_A11Y_CONTRACT };
}
