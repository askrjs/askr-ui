import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { RadioGroup, RadioGroupItem } from '../../../src/components/primitives/radio-group';
import { RADIO_GROUP_A11Y_CONTRACT } from '../../../src/components/primitives/radio-group/radio-group.a11y';
import { flushUpdates, mount, unmount } from '../../test-utils';

function getRadioByText(container: HTMLElement, text: string): HTMLElement {
  const radio = Array.from(
    container.querySelectorAll('[data-slot="radio-group-item"]')
  ).find((element) => element.textContent?.trim() === text);

  if (!(radio instanceof HTMLElement)) {
    throw new Error(`Unable to find radio item with text "${text}"`);
  }

  return radio;
}

describe('RadioGroup - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('renders the radiogroup container and checked hooks in uncontrolled mode', () => {
    container = mount(
      <RadioGroup defaultValue="medium" orientation="horizontal">
        <RadioGroupItem value="small">Small</RadioGroupItem>
        <RadioGroupItem value="medium">Medium</RadioGroupItem>
      </RadioGroup>
    );
    const group = container.querySelector('[data-slot="radio-group"]');
    const small = getRadioByText(container, 'Small');
    const medium = getRadioByText(container, 'Medium');

    expect(group?.getAttribute('role')).toBe(RADIO_GROUP_A11Y_CONTRACT.GROUP_ROLE);
    expect(group?.getAttribute('data-orientation')).toBe('horizontal');
    expect(group?.getAttribute('aria-orientation')).toBe('horizontal');
    expect(small.getAttribute('role')).toBe(RADIO_GROUP_A11Y_CONTRACT.ITEM_ROLE);
    expect(small.getAttribute('aria-checked')).toBe('false');
    expect(small.getAttribute('data-state')).toBe('unchecked');
    expect(medium.getAttribute('aria-checked')).toBe('true');
    expect(medium.getAttribute('data-state')).toBe('checked');
  });

  it('updates uncontrolled selection and hidden input value', async () => {
    container = mount(
      <RadioGroup name="size" defaultValue="small">
        <RadioGroupItem value="small">Small</RadioGroupItem>
        <RadioGroupItem value="medium">Medium</RadioGroupItem>
      </RadioGroup>
    );

    getRadioByText(container, 'Medium').click();
    await flushUpdates();

    expect(getRadioByText(container, 'Small').getAttribute('aria-checked')).toBe(
      'false'
    );
    expect(getRadioByText(container, 'Medium').getAttribute('aria-checked')).toBe(
      'true'
    );
    expect(container.querySelector('input[type="hidden"]')?.getAttribute('value')).toBe(
      'medium'
    );
  });

  it('treats value as controlled state when provided', async () => {
    const onValueChange = vi.fn();

    container = mount(
      <RadioGroup value="small" onValueChange={onValueChange}>
        <RadioGroupItem value="small">Small</RadioGroupItem>
        <RadioGroupItem value="medium">Medium</RadioGroupItem>
      </RadioGroup>
    );

    getRadioByText(container, 'Medium').click();
    await flushUpdates();

    expect(onValueChange).toHaveBeenCalledWith('medium');
    expect(getRadioByText(container, 'Small').getAttribute('aria-checked')).toBe(
      'true'
    );
    expect(getRadioByText(container, 'Medium').getAttribute('aria-checked')).toBe(
      'false'
    );
  });

  it('blocks interaction when the group or item is disabled', async () => {
    const onGroupValueChange = vi.fn();
    const onItemValueChange = vi.fn();

    container = mount(
      <div>
        <RadioGroup disabled defaultValue="small" onValueChange={onGroupValueChange}>
          <RadioGroupItem value="small">Group small</RadioGroupItem>
          <RadioGroupItem value="medium">Group medium</RadioGroupItem>
        </RadioGroup>
        <RadioGroup defaultValue="medium" onValueChange={onItemValueChange}>
          <RadioGroupItem value="small" disabled>
            Item small
          </RadioGroupItem>
          <RadioGroupItem value="medium">Item medium</RadioGroupItem>
        </RadioGroup>
      </div>
    );
    const groupMedium = getRadioByText(container, 'Group medium') as HTMLButtonElement;
    const itemSmall = getRadioByText(container, 'Item small') as HTMLButtonElement;

    expect(groupMedium.disabled).toBe(true);
    expect(itemSmall.disabled).toBe(true);

    groupMedium.click();
    itemSmall.click();
    await flushUpdates();

    expect(onGroupValueChange).not.toHaveBeenCalled();
    expect(onItemValueChange).not.toHaveBeenCalled();
    expect(getRadioByText(container, 'Item medium').getAttribute('aria-checked')).toBe(
      'true'
    );
  });

  it('supports asChild item composition and merges host props', () => {
    container = mount(
      <RadioGroup defaultValue="left">
        <RadioGroupItem
          asChild
          value="left"
          data-testid="radio-item"
          data-from-radio="yes"
        >
          <span data-from-child="yes">Left</span>
        </RadioGroupItem>
      </RadioGroup>
    );
    const host = getRadioByText(container, 'Left');

    expect(host.getAttribute('role')).toBe(RADIO_GROUP_A11Y_CONTRACT.ITEM_ROLE);
    expect(host.getAttribute('data-testid')).toBe('radio-item');
    expect(host.getAttribute('data-from-radio')).toBe('yes');
    expect(host.getAttribute('data-from-child')).toBe('yes');
    expect(host.getAttribute('aria-checked')).toBe('true');
    expect(host.getAttribute('data-state')).toBe('checked');
  });

  it('forwards refs to the group container and item hosts', () => {
    let groupRef: HTMLDivElement | null = null;
    let nativeItemRef: HTMLButtonElement | null = null;
    let childItemRef: HTMLElement | null = null;

    container = mount(
      <RadioGroup ref={(node) => (groupRef = node)} defaultValue="left">
        <RadioGroupItem ref={(node) => (nativeItemRef = node)} value="left">
          Left
        </RadioGroupItem>
      </RadioGroup>
    );
    const group = container.querySelector('[data-slot="radio-group"]') as HTMLDivElement | null;
    const nativeItem = getRadioByText(container, 'Left') as HTMLButtonElement;

    expect(groupRef).toBe(group);
    expect(nativeItemRef).toBe(nativeItem);

    unmount(container);
    container = mount(
      <RadioGroup defaultValue="left">
        <RadioGroupItem
          asChild
          ref={(node) => (childItemRef = node as HTMLElement | null)}
          value="left"
        >
          <span>Left</span>
        </RadioGroupItem>
      </RadioGroup>
    );
    const childHost = getRadioByText(container, 'Left');

    expect(childItemRef).toBe(childHost);
  });

  it('renders a hidden input only when name is provided', () => {
    container = mount(
      <div>
        <RadioGroup defaultValue="small">
          <RadioGroupItem value="small">Unnamed small</RadioGroupItem>
        </RadioGroup>
        <RadioGroup name="named-size" defaultValue="medium">
          <RadioGroupItem value="medium">Named medium</RadioGroupItem>
        </RadioGroup>
      </div>
    );
    const inputs = Array.from(container.querySelectorAll('input[type="hidden"]'));

    expect(inputs).toHaveLength(1);
    expect(inputs[0]?.getAttribute('name')).toBe('named-size');
    expect(inputs[0]?.getAttribute('value')).toBe('medium');
  });
});
