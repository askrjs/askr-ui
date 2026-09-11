import { Label } from '../../../../../src/components/label/label';
import { LABEL_A11Y_CONTRACT } from '../../../../../src/components/label/label.a11y';
import { mount } from '../../_mount';

export function axeLabelledControl(root: HTMLElement): void {
  mount(
    <div>
      <Label key="label" htmlFor="email">
        Email
      </Label>
      <input key="email" id="email" />
    </div>,
    root
  );
}

export function htmlForLinkage(root: HTMLElement) {
  const container = mount(<Label htmlFor="email">Email</Label>, root);

  return {
    association: () =>
      container
        .querySelector(LABEL_A11Y_CONTRACT.ELEMENT)
        ?.getAttribute(LABEL_A11Y_CONTRACT.ASSOCIATION_ATTRIBUTE),
  };
}

/** Exposes the published contract object for the documentation assertion. */
export function contract(): {
  contract: () => typeof LABEL_A11Y_CONTRACT;
} {
  return { contract: () => LABEL_A11Y_CONTRACT };
}
