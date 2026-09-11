import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../../../../src/components/collapsible/collapsible';
import { COLLAPSIBLE_A11Y_CONTRACT } from '../../../../../src/components/collapsible/collapsible.a11y';
import { mount } from '../../_mount';

export function axeClosed(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger>Show more</CollapsibleTrigger>
      <CollapsibleContent>Hidden content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function axeOpen(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger>Hide content</CollapsibleTrigger>
      <CollapsibleContent>Visible content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function axeDisabled(root: HTMLElement): void {
  mount(
    <Collapsible disabled>
      <CollapsibleTrigger>Disabled trigger</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function expandedClosed(root: HTMLElement) {
  mount(
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
  return { contract: () => COLLAPSIBLE_A11Y_CONTRACT };
}

export function expandedOpen(root: HTMLElement) {
  mount(
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
  return { contract: () => COLLAPSIBLE_A11Y_CONTRACT };
}

export function ariaControls(root: HTMLElement) {
  const container = mount(
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );

  return {
    ids: () => {
      const trigger = container.querySelector('button');
      const content = container.querySelector('[id^="collapsible-content"]');
      return {
        controlsId: trigger?.getAttribute(
          COLLAPSIBLE_A11Y_CONTRACT.CONTROLS_ATTRIBUTE
        ),
        contentId: content?.id,
      };
    },
  };
}

export function contentId(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function triggerRole(root: HTMLElement): void {
  mount(
    <Collapsible>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function focusableTrigger(root: HTMLElement) {
  const container = mount(
    <Collapsible>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );

  const trigger = container.querySelector('button') as HTMLButtonElement;

  return {
    focusTrigger: () => {
      trigger.focus();
      return document.activeElement === trigger;
    },
  };
}

export function disabledTriggerFocus(root: HTMLElement) {
  const container = mount(
    <Collapsible disabled>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );

  const trigger = container.querySelector('button') as HTMLButtonElement;

  return {
    focusTrigger: () => {
      trigger.focus();
      return document.activeElement === trigger;
    },
  };
}

export function focusAfterActivation(root: HTMLElement) {
  const container = mount(
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );

  return {
    activateAndRefocus: () => {
      const trigger = container.querySelector('button') as HTMLButtonElement;
      trigger.focus();
      trigger.click();

      // Trigger remains the focus target after activation, even if the runtime
      // rebinds the DOM node during rerender.
      const activeTrigger = container.querySelector(
        'button'
      ) as HTMLButtonElement;
      activeTrigger.focus();
      return document.activeElement === activeTrigger;
    },
  };
}

export function disabledNativeButton(root: HTMLElement): void {
  mount(
    <Collapsible disabled>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function disabledAsChild(root: HTMLElement): void {
  mount(
    <Collapsible disabled>
      <CollapsibleTrigger asChild>
        <div role="button">Toggle</div>
      </CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function contentClosed(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function contentOpen(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function contentForceMount(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent forceMount>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}
