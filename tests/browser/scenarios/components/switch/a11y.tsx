import { Switch } from '../../../../../src/components/switch/switch';
import { SWITCH_A11Y_CONTRACT } from '../../../../../src/components/switch/switch.a11y';
import { mount } from '../../_mount';

export function axeNative(root: HTMLElement): void {
  mount(<Switch>Airplane mode</Switch>, root);
}

export function axeAsChild(root: HTMLElement): void {
  mount(
    <Switch asChild>
      <div aria-label="Power">Power</div>
    </Switch>,
    root
  );
}

export function asChildSemantics(root: HTMLElement) {
  mount(
    <Switch asChild defaultChecked>
      <div>Power</div>
    </Switch>,
    root
  );
  return { contract: () => SWITCH_A11Y_CONTRACT };
}

export function disabledNamed(root: HTMLElement) {
  mount(
    <Switch disabled name="power" value="enabled">
      Power
    </Switch>,
    root
  );
  return { contract: () => SWITCH_A11Y_CONTRACT };
}

/** Exposes the published contract object for the documentation assertion. */
export function contract() {
  return { contract: () => SWITCH_A11Y_CONTRACT };
}
