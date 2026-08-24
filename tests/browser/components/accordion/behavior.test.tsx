import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '../../../../src/components/accordion';
import { ACCORDION_A11Y_CONTRACT } from '../../../../src/components/accordion/accordion.a11y';
import { flushUpdates, mount, unmount } from '../../test-utils';
import { VirtualList } from '../../../../src/components/virtual-list';

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

describe('Accordion - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('should mount single and multiple accordions without render-time state errors', () => {
    expect(() => {
      container = mount(
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
        </div>
      );
    }).not.toThrow();

    expect(container.querySelectorAll('[data-slot="accordion"]')).toHaveLength(
      2
    );
  });

  it('should support single and multiple open state', async () => {
    container = mount(
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
      </div>
    );

    getButtonByText(container, 'Two').click();
    await flushUpdates();

    expect(
      getButtonByText(container, 'Two').getAttribute(
        ACCORDION_A11Y_CONTRACT.EXPANDED_ATTRIBUTE
      )
    ).toBe('true');
    expect(
      getButtonByText(container, 'One').getAttribute(
        ACCORDION_A11Y_CONTRACT.EXPANDED_ATTRIBUTE
      )
    ).toBe('false');

    getButtonByText(container, 'Two multiple').click();
    await flushUpdates();

    const multiOpen = Array.from(
      container.querySelectorAll(
        `[data-accordion] button[${ACCORDION_A11Y_CONTRACT.EXPANDED_ATTRIBUTE}="true"]`
      )
    ).filter((element) => element.textContent?.includes('multiple'));
    expect(multiOpen).toHaveLength(2);
  });

  it('should preserve consecutive uncontrolled updates before rerender', async () => {
    const changes: string[][] = [];

    container = mount(
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
      </Accordion>
    );

    getButtonByText(container, 'One').click();
    getButtonByText(container, 'Two').click();

    expect(changes).toEqual([['one'], ['one', 'two']]);

    await flushUpdates();

    expect(
      container.querySelectorAll(
        `[${ACCORDION_A11Y_CONTRACT.EXPANDED_ATTRIBUTE}="true"]`
      )
    ).toHaveLength(2);
  });

  it('should activate an asChild trigger with Enter and Space', async () => {
    container = mount(
      <Accordion collapsible>
        <AccordionItem value="details">
          <AccordionHeader>
            <AccordionTrigger asChild>
              <span>Details</span>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Body</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    await flushUpdates();

    let trigger = container.querySelector(
      '[data-slot="accordion-trigger"]'
    ) as HTMLElement;
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await flushUpdates();

    trigger = container.querySelector(
      '[data-slot="accordion-trigger"]'
    ) as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(container.textContent).toContain('Body');

    trigger.focus();
    await userEvent.keyboard(' ');
    await flushUpdates();

    trigger = container.querySelector(
      '[data-slot="accordion-trigger"]'
    ) as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(container.textContent).not.toContain('Body');
  });

  it('should move focus when the focused trigger becomes disabled', async () => {
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

    container = mount(<DynamicAccordion />);
    await flushUpdates();
    await flushUpdates();
    getButtonByText(container, 'Two').focus();

    disabled.set(true);
    await flushUpdates();
    await flushUpdates();
    expect(document.activeElement).toBe(getButtonByText(container, 'Three'));

    await userEvent.keyboard('{ArrowUp}');
    await flushUpdates();
    expect(document.activeElement).toBe(getButtonByText(container, 'One'));
  });

  it('should keep controlled state props off the native root', () => {
    container = mount(
      <Accordion value="one" onValueChange={() => undefined}>
        <AccordionItem value="one">
          <AccordionHeader>
            <AccordionTrigger>One</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>First</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const root = container.querySelector('[data-slot="accordion"]');

    expect(root?.getAttribute('value')).toBeNull();
    expect(root?.getAttribute('defaultvalue')).toBeNull();
    expect(root?.getAttribute('onvaluechange')).toBeNull();
  });

  it('should throw when AccordionItem is used outside Accordion', () => {
    expect(() => {
      mount(
        <AccordionItem value="one">
          <AccordionHeader>
            <AccordionTrigger>Invalid</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Body</AccordionContent>
        </AccordionItem>
      );
    }).toThrow('Accordion components must be used within <Accordion>');
  });

  it('should throw when AccordionHeader is used outside AccordionItem', () => {
    expect(() => {
      mount(
        <Accordion>
          <AccordionHeader>
            <AccordionTrigger>Invalid</AccordionTrigger>
          </AccordionHeader>
        </Accordion>
      );
    }).toThrow('Accordion parts must be used within <AccordionItem>');
  });

  it('should throw when AccordionContent is used outside AccordionItem', () => {
    expect(() => {
      mount(
        <Accordion>
          <AccordionContent>Invalid</AccordionContent>
        </Accordion>
      );
    }).toThrow('Accordion parts must be used within <AccordionItem>');
  });

  it('should preserve dataset indices and advance focus through a virtualized window', async () => {
    const items = Array.from({ length: 100 }, (_, index) => ({
      id: `item-${index}`,
      label: `Item ${index}`,
    }));
    container = mount(
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
      </Accordion>
    );
    const viewport = container.querySelector(
      '[data-slot="virtual-list"]'
    ) as HTMLElement;
    await flushUpdates();
    viewport.scrollTop = 800;
    viewport.dispatchEvent(new Event('scroll'));
    await flushUpdates();
    await flushUpdates();
    await flushUpdates();

    expect(viewport.dataset.virtualVisibleStartIndex).toBe('40');
    expect(
      Array.from(container.querySelectorAll('button')).some(
        (button) => button.textContent?.trim() === 'Item 43'
      )
    ).toBe(false);
    let item42 = getButtonByText(container, 'Item 42');
    item42.click();
    await flushUpdates();
    item42 = getButtonByText(container, 'Item 42');
    item42.focus({ preventScroll: true });
    expect(
      item42
        .closest('[data-slot="virtual-list-row"]')
        ?.getAttribute('data-askr-virtual-list-row-height')
    ).toBe('20');
    const arrowDown = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'ArrowDown',
    });
    item42.dispatchEvent(arrowDown);
    expect(arrowDown.defaultPrevented).toBe(true);
    await flushUpdates();
    await flushUpdates();
    await flushUpdates();

    expect(Number(viewport.dataset.virtualVisibleStartIndex)).toBeGreaterThan(
      40
    );
    expect(document.activeElement?.textContent).toBe('Item 43');
  });
});
