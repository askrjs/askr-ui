import { VisuallyHidden } from '../../../../../src/components/visually-hidden/visually-hidden';
import { mount } from '../../_mount';

export function axeHiddenAccessibleText(root: HTMLElement): void {
  mount(
    <button>
      <VisuallyHidden>Open menu</VisuallyHidden>
    </button>,
    root
  );
}

export function composedChild(root: HTMLElement) {
  const container = mount(
    <VisuallyHidden asChild children={<strong>Hidden</strong>} />,
    root
  );

  return {
    hiddenState: () => {
      const strong = container.querySelector('strong') as HTMLElement;
      return {
        marker: strong.getAttribute('data-askr-visually-hidden'),
        styleAttribute: strong.getAttribute('style'),
        position: getComputedStyle(strong).position,
      };
    },
  };
}
