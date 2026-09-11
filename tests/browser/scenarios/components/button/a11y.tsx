import { Button } from '../../../../../src/components/button/button';
import { BUTTON_A11Y_CONTRACT } from '../../../../../src/components/button/button.a11y';
import { mount } from '../../_mount';

export function axeNative(root: HTMLElement): void {
  mount(<Button>Save</Button>, root);
}

export function axeAsChild(root: HTMLElement): void {
  mount(
    <Button asChild>
      <a href="/docs" aria-label="Read documentation">
        Docs
      </a>
    </Button>,
    root
  );
}

export function nativeDisabled(root: HTMLElement): void {
  mount(<Button disabled>Save</Button>, root);
}

export function asChildDisabled(root: HTMLElement): void {
  mount(
    <Button asChild disabled>
      <a href="/docs">Docs</a>
    </Button>,
    root
  );
}

export function accessibleNaming(root: HTMLElement): void {
  mount(
    <div>
      <span key="button-label" id="button-label">
        Submit form
      </span>
      <Button key="button" aria-labelledby="button-label">
        Submit
      </Button>
    </div>,
    root
  );
}

/** Exposes the published contract object for the documentation assertion. */
export function contract(): {
  contract: () => typeof BUTTON_A11Y_CONTRACT;
} {
  return { contract: () => BUTTON_A11Y_CONTRACT };
}
