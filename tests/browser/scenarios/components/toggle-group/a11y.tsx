import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../../../src/components/toggle-group';
import { TOGGLE_GROUP_A11Y_CONTRACT } from '../../../../../src/components/toggle-group/toggle-group.a11y';
import { mount } from '../../_mount';

export function axeNativeItems(root: HTMLElement): void {
  mount(
    <ToggleGroup defaultValue="left">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>,
    root
  );
}

export function axeAsChildItems(root: HTMLElement): void {
  mount(
    <ToggleGroup aria-label="Text alignment" defaultValue="left">
      <ToggleGroupItem asChild value="left">
        <span>Left</span>
      </ToggleGroupItem>
      <ToggleGroupItem asChild value="center">
        <span>Center</span>
      </ToggleGroupItem>
    </ToggleGroup>,
    root
  );
}

export function nativeSemantics(root: HTMLElement) {
  mount(
    <ToggleGroup aria-label="Text alignment" defaultValue="left">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>,
    root
  );
  return { contract: () => TOGGLE_GROUP_A11Y_CONTRACT };
}

export function asChildSemantics(root: HTMLElement) {
  mount(
    <ToggleGroup defaultValue="left">
      <ToggleGroupItem asChild value="left">
        <span>Left</span>
      </ToggleGroupItem>
    </ToggleGroup>,
    root
  );
  return { contract: () => TOGGLE_GROUP_A11Y_CONTRACT };
}

export function asChildDisabled(root: HTMLElement): void {
  mount(
    <ToggleGroup defaultValue="left">
      <ToggleGroupItem asChild value="left" disabled>
        <span>Left</span>
      </ToggleGroupItem>
    </ToggleGroup>,
    root
  );
}

/** Exposes the published contract object for the documentation assertion. */
export function contract(): {
  contract: () => typeof TOGGLE_GROUP_A11Y_CONTRACT;
} {
  return { contract: () => TOGGLE_GROUP_A11Y_CONTRACT };
}
