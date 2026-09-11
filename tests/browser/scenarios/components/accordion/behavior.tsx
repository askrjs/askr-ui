import { state } from '@askrjs/askr';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '../../../../../src/components/accordion';
import { ACCORDION_A11Y_CONTRACT } from '../../../../../src/components/accordion/accordion.a11y';
import { VirtualList } from '../../../../../src/components/virtual-list';
import { flushUpdates, mount } from '../../_mount';

function getButtonByText(
  container: HTMLElement,
  text: string
): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button')).find(
    (element) => element.textContent?.trim() === text
  );

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Unable to find button with text "${text}"`);
  }

  return button;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function mountsWithoutRenderErrors(root: HTMLElement) {
  let error: string | null = null;

  try {
    mount(
      <div>
        <Accordion defaultValue="one" collapsible>
          <AccordionItem value="one">
            <AccordionHeader>
              <AccordionTrigger>One</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>First</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion type="multiple" defaultValue={['one']}>
          <AccordionItem value="one">
            <AccordionHeader>
              <AccordionTrigger>One multiple</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>First multiple</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>,
      root
    );
  } catch (caught) {
    error = messageOf(caught);
  }

  return { error: () => error };
}

export function openStateModes(root: HTMLElement) {
  const container = mount(
    <div>
      <Accordion key="single" defaultValue="one" collapsible>
        <AccordionItem value="one">
          <AccordionHeader>
            <AccordionTrigger>One</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>First</AccordionContent>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionHeader>
            <AccordionTrigger>Two</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Second</AccordionContent>
        </AccordionItem>
      </Accordion>
      <Accordion key="multiple" type="multiple" defaultValue={['one']}>
        <AccordionItem value="one">
          <AccordionHeader>
            <AccordionTrigger>One multiple</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>First multiple</AccordionContent>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionHeader>
            <AccordionTrigger>Two multiple</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Second multiple</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>,
    root
  );

  return {
    clickButton: async (text: string) => {
      getButtonByText(container, text).click();
      await flushUpdates();
    },
    expanded: (text: string) =>
      getButtonByText(container, text).getAttribute(
        ACCORDION_A11Y_CONTRACT.EXPANDED_ATTRIBUTE
      ),
    multipleOpenCount: () =>
      Array.from(
        container.querySelectorAll(
          `[data-accordion] button[${ACCORDION_A11Y_CONTRACT.EXPANDED_ATTRIBUTE}="true"]`
        )
      ).filter((element) => element.textContent?.includes('multiple')).length,
  };
}

export function consecutiveUncontrolledUpdates(root: HTMLElement) {
  const changes: string[][] = [];

  const container = mount(
    <Accordion
      type="multiple"
      onValueChange={(value) => changes.push([...value])}
    >
      <AccordionItem value="one">
        <AccordionHeader>
          <AccordionTrigger>One</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>First</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionHeader>
          <AccordionTrigger>Two</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>Second</AccordionContent>
      </AccordionItem>
    </Accordion>,
    root
  );

  return {
    /** Both clicks happen without an intervening flush, as the original did. */
    clickBoth: () => {
      getButtonByText(container, 'One').click();
      getButtonByText(container, 'Two').click();
      return changes.map((change) => [...change]);
    },
    flush: async () => {
      await flushUpdates();
    },
    expandedCount: () =>
      container.querySelectorAll(
        `[${ACCORDION_A11Y_CONTRACT.EXPANDED_ATTRIBUTE}="true"]`
      ).length,
  };
}

export async function asChildKeyboardActivation(root: HTMLElement) {
  const container = mount(
    <Accordion collapsible>
      <AccordionItem value="details">
        <AccordionHeader>
          <AccordionTrigger asChild>
            <span>Details</span>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>Body</AccordionContent>
      </AccordionItem>
    </Accordion>,
    root
  );
  await flushUpdates();

  const currentTrigger = () =>
    container.querySelector('[data-slot="accordion-trigger"]') as HTMLElement;

  return {
    /** Re-queries before focusing: the trigger node is replaced per render. */
    focusTrigger: () => {
      currentTrigger().focus();
    },
    flush: async () => {
      await flushUpdates();
    },
    triggerState: () => ({
      expanded: currentTrigger().getAttribute('aria-expanded'),
      hasBody: container.textContent?.includes('Body') ?? false,
    }),
  };
}

export function focusMovesWhenTriggerDisabled(root: HTMLElement) {
  let disabled!: ReturnType<typeof state<boolean>>;

  function DynamicAccordion() {
    disabled = state(false);
    return (
      <Accordion orientation="vertical">
        <AccordionItem value="one">
          <AccordionHeader>
            <AccordionTrigger>One</AccordionTrigger>
          </AccordionHeader>
        </AccordionItem>
        <AccordionItem value="two" disabled={disabled()}>
          <AccordionHeader>
            <AccordionTrigger>Two</AccordionTrigger>
          </AccordionHeader>
        </AccordionItem>
        <AccordionItem value="three">
          <AccordionHeader>
            <AccordionTrigger>Three</AccordionTrigger>
          </AccordionHeader>
        </AccordionItem>
      </Accordion>
    );
  }

  const container = mount(<DynamicAccordion />, root);

  return {
    focusSecondTrigger: async () => {
      await flushUpdates();
      await flushUpdates();
      getButtonByText(container, 'Two').focus();
    },
    disableSecondItem: async () => {
      disabled.set(true);
      await flushUpdates();
      await flushUpdates();
    },
    flush: async () => {
      await flushUpdates();
    },
    activeIs: (text: string) =>
      document.activeElement === getButtonByText(container, text),
  };
}

export function controlledPropsOffRoot(root: HTMLElement): void {
  mount(
    <Accordion value="one" onValueChange={() => undefined}>
      <AccordionItem value="one">
        <AccordionHeader>
          <AccordionTrigger>One</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>First</AccordionContent>
      </AccordionItem>
    </Accordion>,
    root
  );
}

export function itemOutsideAccordion(root: HTMLElement) {
  let error: string | null = null;

  try {
    mount(
      <AccordionItem value="one">
        <AccordionHeader>
          <AccordionTrigger>Invalid</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>Body</AccordionContent>
      </AccordionItem>,
      root
    );
  } catch (caught) {
    error = messageOf(caught);
  }

  return { error: () => error };
}

export function headerOutsideItem(root: HTMLElement) {
  let error: string | null = null;

  try {
    mount(
      <Accordion>
        <AccordionHeader>
          <AccordionTrigger>Invalid</AccordionTrigger>
        </AccordionHeader>
      </Accordion>,
      root
    );
  } catch (caught) {
    error = messageOf(caught);
  }

  return { error: () => error };
}

export function contentOutsideItem(root: HTMLElement) {
  let error: string | null = null;

  try {
    mount(
      <Accordion>
        <AccordionContent>Invalid</AccordionContent>
      </Accordion>,
      root
    );
  } catch (caught) {
    error = messageOf(caught);
  }

  return { error: () => error };
}

export function virtualizedWindow(root: HTMLElement) {
  const items = Array.from({ length: 100 }, (_, index) => ({
    id: `item-${index}`,
    label: `Item ${index}`,
  }));
  const container = mount(
    <Accordion>
      <VirtualList
        style={{ height: '60px', overflowY: 'auto' }}
        items={items}
        rowHeight={20}
        getKey={(item) => item.id}
        rowComponent={({ item }) => (
          <AccordionItem value={item.id}>
            <AccordionHeader>
              <AccordionTrigger>{item.label}</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>Details</AccordionContent>
          </AccordionItem>
        )}
      />
    </Accordion>,
    root
  );
  const viewport = container.querySelector(
    '[data-slot="virtual-list"]'
  ) as HTMLElement;

  return {
    scrollWindow: async () => {
      await flushUpdates();
      viewport.scrollTop = 800;
      viewport.dispatchEvent(new Event('scroll'));
      await flushUpdates();
      await flushUpdates();
      await flushUpdates();
    },
    visibleStartIndex: () =>
      viewport.dataset.virtualVisibleStartIndex ?? null,
    hasItem43Button: () =>
      Array.from(container.querySelectorAll('button')).some(
        (button) => button.textContent?.trim() === 'Item 43'
      ),
    activateItem42: async () => {
      let item42 = getButtonByText(container, 'Item 42');
      item42.click();
      await flushUpdates();
      item42 = getButtonByText(container, 'Item 42');
      item42.focus({ preventScroll: true });
      const rowHeight =
        item42
          .closest('[data-slot="virtual-list-row"]')
          ?.getAttribute('data-askr-virtual-list-row-height') ?? null;
      const arrowDown = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'ArrowDown',
      });
      item42.dispatchEvent(arrowDown);
      return { rowHeight, defaultPrevented: arrowDown.defaultPrevented };
    },
    settle: async () => {
      await flushUpdates();
      await flushUpdates();
      await flushUpdates();
    },
    visibleStartIndexNumber: () =>
      Number(viewport.dataset.virtualVisibleStartIndex),
    activeText: () => document.activeElement?.textContent ?? null,
  };
}
