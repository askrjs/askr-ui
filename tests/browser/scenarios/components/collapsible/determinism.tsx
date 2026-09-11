import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../../../../src/components/collapsible/collapsible';
import {
  type DeterministicRender,
  deterministicRender,
  mount,
} from '../../_mount';

function normalizeCollapsibleHtml(html: string): string {
  return html.replace(/collapsible-content-\d+/g, 'collapsible-content-id');
}

/**
 * `deterministicRender` with the collapsible id normalization the vitest
 * original applied: content ids carry a per-mount counter that is not part of
 * the render contract.
 */
function collapsibleRender(
  label: string,
  factory: () => JSX.Element
): DeterministicRender {
  const render = deterministicRender(label, factory);
  return {
    label: render.label,
    first: normalizeCollapsibleHtml(render.first),
    second: normalizeCollapsibleHtml(render.second),
  };
}

export function closedMarkup() {
  const props = { defaultOpen: false };
  return {
    renders: () => [
      collapsibleRender('closed collapsible', () => (
        <Collapsible {...props}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )),
    ],
  };
}

export function openMarkup() {
  const props = { defaultOpen: true };
  return {
    renders: () => [
      collapsibleRender('open collapsible', () => (
        <Collapsible {...props}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )),
    ],
  };
}

export function disabledMarkup() {
  const props = { disabled: true, defaultOpen: false };
  return {
    renders: () => [
      collapsibleRender('disabled collapsible', () => (
        <Collapsible {...props}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )),
    ],
  };
}

export function stableChildren() {
  return {
    renders: () => [
      collapsibleRender('static children', () => (
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger>Toggle Button</CollapsibleTrigger>
          <CollapsibleContent>Stable Content</CollapsibleContent>
        </Collapsible>
      )),
    ],
  };
}

export function stateTransitions(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function ariaPresenceClosed(root: HTMLElement): void {
  mount(
    <Collapsible>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function ariaPresenceOpen(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function contentPresence(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function forceMountPresence(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent forceMount>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function idGeneration(root: HTMLElement) {
  const container = mount(
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );

  return {
    ids: () => {
      const trigger = container.querySelector('button') as HTMLButtonElement;
      const content = container.querySelector(
        '[id^="collapsible-content"]'
      ) as HTMLElement;

      const controlsId = trigger.getAttribute('aria-controls');
      const contentId = content.id;

      // Toggle state - IDs should remain the same
      trigger.click(); // close
      (container.querySelector('button') as HTMLButtonElement).click(); // reopen

      const contentAfter = container.querySelector(
        '[id^="collapsible-content"]'
      ) as HTMLElement;

      return {
        controlsId,
        contentId,
        contentIdAfter: contentAfter.id,
        controlsIdAfter: trigger.getAttribute('aria-controls'),
      };
    },
  };
}
