import { state } from '@askrjs/askr';

import { Button } from '../../../../../src/components/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../../../../src/components/collapsible/collapsible';
import { VirtualList } from '../../../../../src/components/virtual-list';
import { flushUpdates, mount, spy, unmount } from '../../_mount';

export function recycledVirtualRow(root: HTMLElement) {
  function Fixture() {
    const rows = state([{ id: 'row-a' }, { id: 'row-b' }, { id: 'row-c' }]);
    return (
      <VirtualList
        style={{ height: '20px', overflowY: 'auto' }}
        items={rows()}
        rowHeight={20}
        getKey={(row) => row.id}
        rowComponent={({ item }) => (
          <div data-row-id={item.id}>
            <Collapsible
              open={false}
              onOpenChange={() => rows.set(rows().slice(1))}
            >
              <CollapsibleTrigger>Toggle</CollapsibleTrigger>
              <CollapsibleContent>Content</CollapsibleContent>
            </Collapsible>
          </div>
        )}
      />
    );
  }

  const container = mount(<Fixture />, root);

  return {
    recycle: async () => {
      const first = container.querySelector('button') as HTMLButtonElement;
      const firstContentId = first.getAttribute('aria-controls');
      first.focus();
      first.click();
      await Promise.resolve();

      const replacement = container.querySelector(
        'button'
      ) as HTMLButtonElement;

      return {
        firstContentId,
        replacementRowId:
          replacement.closest('[data-row-id]')?.getAttribute('data-row-id') ??
          null,
        replacementContentId: replacement.getAttribute('aria-controls'),
        replacementFocused: document.activeElement === replacement,
      };
    },
  };
}

export function startClosed(root: HTMLElement): void {
  mount(
    <Collapsible>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function startOpen(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function toggleOnClick(root: HTMLElement): void {
  mount(
    <Collapsible>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function controlledOpen(root: HTMLElement): void {
  mount(
    <Collapsible open={true}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function controlledOpenChange(root: HTMLElement) {
  const onOpenChange = spy<[boolean]>();
  mount(
    <Collapsible open={false} onOpenChange={onOpenChange}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );

  return { openChangeArgs: () => onOpenChange.calls.map(([open]) => open) };
}

export function nativeTrigger(root: HTMLElement): void {
  mount(
    <Collapsible>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function asChildTrigger(root: HTMLElement): void {
  mount(
    <Collapsible>
      <CollapsibleTrigger asChild>
        <span>Custom Trigger</span>
      </CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function keyboardToggle(root: HTMLElement) {
  const onNativeOpenChange = spy<[boolean]>();
  const nativeContainer = mount(
    <Collapsible onOpenChange={onNativeOpenChange}>
      <CollapsibleTrigger>Native trigger</CollapsibleTrigger>
      <CollapsibleContent>Native content</CollapsibleContent>
    </Collapsible>,
    root
  );

  const onChildOpenChange = spy<[boolean]>();
  let childContainer!: HTMLElement;

  return {
    /** Re-queries the trigger after a settle, as the vitest original did. */
    focusNative: async () => {
      await flushUpdates();
      (nativeContainer.querySelector('button') as HTMLElement).focus();
    },
    flush: async () => {
      await flushUpdates();
    },
    nativeState: () => ({
      calls: onNativeOpenChange.calls.map(([open]) => open),
      text: nativeContainer.textContent ?? '',
    }),
    mountChild: () => {
      unmount(nativeContainer);
      childContainer = mount(
        <Collapsible onOpenChange={onChildOpenChange}>
          <CollapsibleTrigger asChild>
            <span>Child trigger</span>
          </CollapsibleTrigger>
          <CollapsibleContent>Child content</CollapsibleContent>
        </Collapsible>,
        root
      );
    },
    focusChild: async () => {
      await flushUpdates();
      (
        childContainer.querySelector(
          '[data-collapsible-trigger="true"]'
        ) as HTMLElement
      ).focus();
    },
    childState: () => ({
      calls: onChildOpenChange.calls.map(([open]) => open),
      text: childContainer.textContent ?? '',
    }),
  };
}

export function buttonComposition(root: HTMLElement): void {
  mount(
    <Collapsible>
      <Button asChild variant="ghost" size="sm">
        <CollapsibleTrigger>Advanced policy</CollapsibleTrigger>
      </Button>
      <CollapsibleContent>Policy detail</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function contentClosedByDefault(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function contentMountedWhenOpen(root: HTMLElement): void {
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

export function asChildContent(root: HTMLElement): void {
  mount(
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent asChild>
        <section>Custom Content</section>
      </CollapsibleContent>
    </Collapsible>,
    root
  );
}

export function disabledToggle(root: HTMLElement) {
  const onOpenChange = spy<[boolean]>();
  mount(
    <Collapsible disabled onOpenChange={onOpenChange}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>,
    root
  );

  return { openChangeCount: () => onOpenChange.count() };
}

function captureMountError(element: JSX.Element, root: HTMLElement): string {
  try {
    mount(element, root);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return '';
}

export function orphanTrigger(root: HTMLElement) {
  const message = captureMountError(
    <CollapsibleTrigger>Invalid</CollapsibleTrigger>,
    root
  );
  return { message: () => message };
}

export function orphanContent(root: HTMLElement) {
  const message = captureMountError(
    <CollapsibleContent>Invalid</CollapsibleContent>,
    root
  );
  return { message: () => message };
}

export function uniqueIds(root: HTMLElement) {
  const container = mount(
    <div>
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger>Toggle 1</CollapsibleTrigger>
        <CollapsibleContent>Content 1</CollapsibleContent>
      </Collapsible>
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger>Toggle 2</CollapsibleTrigger>
        <CollapsibleContent>Content 2</CollapsibleContent>
      </Collapsible>
    </div>,
    root
  );

  return {
    ids: () =>
      Array.from(container.querySelectorAll('[id^="collapsible-content"]')).map(
        (element) => element.id
      ),
  };
}
