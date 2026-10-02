import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../../src/components/radio-group';
import { RADIO_GROUP_A11Y_CONTRACT } from '../../../../../src/components/radio-group/radio-group.a11y';
import { mount } from '../../_mount';

export function axeNative(root: HTMLElement): void {
  mount(
    <RadioGroup aria-label="Size" defaultValue="m">
      <RadioGroupItem value="s">Small</RadioGroupItem>
      <RadioGroupItem value="m">Medium</RadioGroupItem>
    </RadioGroup>,
    root
  );
}

export function axeAsChild(root: HTMLElement): void {
  mount(
    <RadioGroup aria-label="Alignment" defaultValue="center">
      <RadioGroupItem asChild value="left">
        <span>Left</span>
      </RadioGroupItem>
      <RadioGroupItem asChild value="center">
        <span>Center</span>
      </RadioGroupItem>
    </RadioGroup>,
    root
  );
}

export function groupSemantics(root: HTMLElement) {
  mount(
    <RadioGroup aria-label="Size" defaultValue="m" orientation="horizontal">
      <RadioGroupItem value="s">Small</RadioGroupItem>
      <RadioGroupItem value="m">Medium</RadioGroupItem>
    </RadioGroup>,
    root
  );
  return { contract: () => RADIO_GROUP_A11Y_CONTRACT };
}

export function bothOrientation(root: HTMLElement) {
  mount(
    <RadioGroup
      aria-label="Two dimensional"
      orientation="both"
      defaultValue="center"
    >
      <RadioGroupItem value="center">Center</RadioGroupItem>
    </RadioGroup>,
    root
  );
  return { contract: () => RADIO_GROUP_A11Y_CONTRACT };
}

export function disabledAsChild(root: HTMLElement): void {
  mount(
    <RadioGroup aria-label="Alignment" defaultValue="left">
      <RadioGroupItem asChild value="left" disabled>
        <span>Left</span>
      </RadioGroupItem>
    </RadioGroup>,
    root
  );
}

/** Exposes the published contract object for the documentation assertion. */
export function contract() {
  return { contract: () => RADIO_GROUP_A11Y_CONTRACT };
}
