import { afterEach, describe, expect, it } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '../../../src/components/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../src/components/tabs';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../src/components/toggle-group';
import { flushUpdates, mount, unmount } from '../../test-utils';

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

describe('Disclosure components - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('supports single and multiple accordion open state', async () => {
    container = mount(
      <div>
        <Accordion defaultValue="one" collapsible>
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
        <Accordion type="multiple" defaultValue={['one']}>
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
      getButtonByText(container, 'Two').getAttribute('aria-expanded')
    ).toBe('true');
    expect(
      getButtonByText(container, 'One').getAttribute('aria-expanded')
    ).toBe('false');

    getButtonByText(container, 'Two multiple').click();
    await flushUpdates();

    const multiOpen = Array.from(
      container.querySelectorAll(
        '[data-accordion] button[aria-expanded="true"]'
      )
    ).filter((element) => element.textContent?.includes('multiple'));
    expect(multiOpen).toHaveLength(2);
  });

  it('supports automatic and manual tab activation', async () => {
    container = mount(
      <div>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview panel</TabsContent>
          <TabsContent value="settings">Settings panel</TabsContent>
        </Tabs>
        <Tabs defaultValue="overview" activationMode="manual">
          <TabsList>
            <TabsTrigger value="overview">Overview manual</TabsTrigger>
            <TabsTrigger value="settings">Settings manual</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview manual panel</TabsContent>
          <TabsContent value="settings">Settings manual panel</TabsContent>
        </Tabs>
      </div>
    );

    getButtonByText(container, 'Settings').focus();
    await flushUpdates();
    expect(container.querySelector('[role="tabpanel"]')?.textContent).toContain(
      'Settings panel'
    );

    getButtonByText(container, 'Settings manual').focus();
    await flushUpdates();
    expect(
      Array.from(container.querySelectorAll('[role="tabpanel"]')).some(
        (panel) => panel.textContent?.includes('Settings manual panel')
      )
    ).toBe(false);

    getButtonByText(container, 'Settings manual').click();
    await flushUpdates();
    expect(
      Array.from(container.querySelectorAll('[role="tabpanel"]')).some(
        (panel) => panel.textContent?.includes('Settings manual panel')
      )
    ).toBe(true);
  });

  it('supports single and multiple toggle group selection', async () => {
    container = mount(
      <div>
        <ToggleGroup defaultValue="left">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="multiple" defaultValue={['left']}>
          <ToggleGroupItem value="left">Left multiple</ToggleGroupItem>
          <ToggleGroupItem value="right">Right multiple</ToggleGroupItem>
        </ToggleGroup>
      </div>
    );

    getButtonByText(container, 'Right').click();
    await flushUpdates();

    expect(
      getButtonByText(container, 'Left').getAttribute('aria-pressed')
    ).toBe('false');
    expect(
      getButtonByText(container, 'Right').getAttribute('aria-pressed')
    ).toBe('true');

    getButtonByText(container, 'Right multiple').click();
    await flushUpdates();

    expect(
      getButtonByText(container, 'Left multiple').getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      getButtonByText(container, 'Right multiple').getAttribute('aria-pressed')
    ).toBe('true');
  });
});
