import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../../src/components/popover';
import { POPOVER_A11Y_CONTRACT } from '../../../../../src/components/popover/popover.a11y';
import { mount } from '../../_mount';

export function axeDefaultOpen(root: HTMLElement): void {
  mount(
    <Popover defaultOpen>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent>Popover body</PopoverContent>
    </Popover>,
    root
  );
}

export function triggerLabeling(root: HTMLElement) {
  const container = mount(
    <Popover defaultOpen>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent>Popover body</PopoverContent>
    </Popover>,
    root
  );

  return {
    labeling: () => {
      const trigger = container.querySelector(
        `[${POPOVER_A11Y_CONTRACT.TRIGGER_ATTRIBUTES.popup}="dialog"]`
      );
      const content = document.body.querySelector(
        `[role="${POPOVER_A11Y_CONTRACT.CONTENT_ATTRIBUTES.role}"]`
      );

      return {
        hasTrigger: Boolean(trigger),
        hasContent: Boolean(content),
        triggerId: trigger?.id ?? '',
        contentLabelledBy: content?.getAttribute(
          POPOVER_A11Y_CONTRACT.CONTENT_ATTRIBUTES.labelledBy
        ),
      };
    },
  };
}

export function explicitAriaLabel(root: HTMLElement) {
  mount(
    <Popover defaultOpen>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent aria-label="Popover content">Popover body</PopoverContent>
    </Popover>,
    root
  );

  return {
    content: () => {
      const content = document.body.querySelector(
        `[role="${POPOVER_A11Y_CONTRACT.CONTENT_ATTRIBUTES.role}"]`
      );

      return {
        hasContent: Boolean(content),
        ariaLabel: content?.getAttribute('aria-label'),
        hasLabelledBy: content?.hasAttribute('aria-labelledby') ?? false,
      };
    },
  };
}
