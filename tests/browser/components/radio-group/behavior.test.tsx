import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../src/components/radio-group';
import { mount, unmount } from '../../test-utils';
import { flushUpdates } from '../../test-utils';
import { RADIO_GROUP_A11Y_CONTRACT } from '../../../../src/components/radio-group/radio-group.a11y';

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

  it('should render the radiogroup container and checked hooks in uncontrolled mode', () => {
    container = mount(
      <RadioGroup defaultValue="medium" orientation="horizontal">
        <RadioGroupItem value="small">Small</RadioGroupItem>
        <RadioGroupItem value="medium">Medium</RadioGroupItem>
      </RadioGroup>
    );
    const group = container.querySelector('[data-slot="radio-group"]');
    const small = getRadioByText(container, 'Small');
    const medium = getRadioByText(container, 'Medium');

    expect(group?.getAttribute('role')).toBe(
      RADIO_GROUP_A11Y_CONTRACT.GROUP_ROLE
    );
    expect(group?.getAttribute('data-orientation')).toBe('horizontal');
    expect(group?.getAttribute('aria-orientation')).toBe('horizontal');
    expect(small.getAttribute('role')).toBe(
      RADIO_GROUP_A11Y_CONTRACT.ITEM_ROLE
    );
    expect(small.getAttribute('aria-checked')).toBe('false');
    expect(small.getAttribute('data-state')).toBe('unchecked');
    expect(medium.getAttribute('aria-checked')).toBe('true');
    expect(medium.getAttribute('data-state')).toBe('checked');
  });

  it('should update uncontrolled selection and hidden input value', async () => {
    container = mount(
      <RadioGroup name="size" defaultValue="small">
        <RadioGroupItem value="small">Small</RadioGroupItem>
        <RadioGroupItem value="medium">Medium</RadioGroupItem>
      </RadioGroup>
    );

    getRadioByText(container, 'Medium').click();
    await flushUpdates();

    expect(
      getRadioByText(container, 'Small').getAttribute('aria-checked')
    ).toBe('false');
    expect(
      getRadioByText(container, 'Medium').getAttribute('aria-checked')
    ).toBe('true');
    expect(
      container.querySelector('input[type="hidden"]')?.getAttribute('value')
    ).toBe('medium');
  });

  it('should support nested radio items without relying on direct child cloning', async () => {
    container = mount(
      <RadioGroup name="size" defaultValue="small">
        <div>
          <RadioGroupItem value="small">Small</RadioGroupItem>
        </div>
        <div>
          <RadioGroupItem value="medium">Medium</RadioGroupItem>
        </div>
      </RadioGroup>
    );

    getRadioByText(container, 'Medium').click();
    await flushUpdates();

    expect(
      getRadioByText(container, 'Small').getAttribute('aria-checked')
    ).toBe('false');
    expect(
      getRadioByText(container, 'Medium').getAttribute('aria-checked')
    ).toBe('true');
    expect(
      container.querySelector('input[type="hidden"]')?.getAttribute('value')
    ).toBe('medium');
  });

  it('should treat value as controlled state when provided', async () => {
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
    expect(
      getRadioByText(container, 'Small').getAttribute('aria-checked')
    ).toBe('true');
    expect(
      getRadioByText(container, 'Medium').getAttribute('aria-checked')
    ).toBe('false');
  });

  it('should block interaction when the group or item is disabled', async () => {
    const onGroupValueChange = vi.fn();
    const onItemValueChange = vi.fn();

    container = mount(
      <div>
        <RadioGroup
          disabled
          defaultValue="small"
          onValueChange={onGroupValueChange}
        >
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
    const groupMedium = getRadioByText(
      container,
      'Group medium'
    ) as HTMLButtonElement;
    const itemSmall = getRadioByText(
      container,
      'Item small'
    ) as HTMLButtonElement;

    expect(groupMedium.disabled).toBe(true);
    expect(itemSmall.disabled).toBe(true);

    groupMedium.click();
    itemSmall.click();
    await flushUpdates();

    expect(onGroupValueChange).not.toHaveBeenCalled();
    expect(onItemValueChange).not.toHaveBeenCalled();
    expect(
      getRadioByText(container, 'Item medium').getAttribute('aria-checked')
    ).toBe('true');
  });

  it('should support asChild item composition and merge host props', () => {
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

  it('should ignore Enter and activate native and asChild items with Space', async () => {
    container = mount(
      <RadioGroup defaultValue="small">
        <RadioGroupItem value="small">Small</RadioGroupItem>
        <RadioGroupItem asChild value="medium">
          <span>Medium</span>
        </RadioGroupItem>
      </RadioGroup>
    );
    await flushUpdates();
    await flushUpdates();

    let medium = getRadioByText(container, 'Medium');
    medium.focus();
    await userEvent.keyboard('{Enter}');
    await flushUpdates();

    expect(
      getRadioByText(container, 'Medium').getAttribute('aria-checked')
    ).toBe('false');

    medium = getRadioByText(container, 'Medium');
    medium.focus();
    await userEvent.keyboard(' ');
    await flushUpdates();

    medium = getRadioByText(container, 'Medium');
    expect(medium.getAttribute('aria-checked')).toBe('true');

    const nativeSmall = getRadioByText(container, 'Small');
    nativeSmall.focus();
    await userEvent.keyboard('{Enter}');
    await flushUpdates();

    expect(
      getRadioByText(container, 'Small').getAttribute('aria-checked')
    ).toBe('false');
    expect(
      getRadioByText(container, 'Medium').getAttribute('aria-checked')
    ).toBe('true');
  });

  it('should restore its uncontrolled value when its native form resets', async () => {
    const onValueChange = vi.fn();
    container = mount(
      <form>
        <RadioGroup
          defaultValue="small"
          name="size"
          onValueChange={onValueChange}
        >
          <RadioGroupItem value="small">Small</RadioGroupItem>
          <RadioGroupItem value="medium">Medium</RadioGroupItem>
        </RadioGroup>
      </form>
    );
    await flushUpdates();
    getRadioByText(container, 'Medium').click();
    await flushUpdates();

    (container.querySelector('form') as HTMLFormElement).reset();
    await flushUpdates();

    expect(
      getRadioByText(container, 'Small').getAttribute('aria-checked')
    ).toBe('true');
    expect(onValueChange.mock.calls).toEqual([['medium'], ['small']]);
  });

  it('should forward refs to the group container and item hosts', () => {
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
    const group = container.querySelector(
      '[data-slot="radio-group"]'
    ) as HTMLDivElement | null;
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

  it('should render a hidden input only when name is provided', () => {
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
    const inputs = Array.from(
      container.querySelectorAll('input[type="hidden"]')
    );

    expect(inputs).toHaveLength(1);
    expect(inputs[0]?.getAttribute('name')).toBe('named-size');
    expect(inputs[0]?.getAttribute('value')).toBe('medium');
  });

  it('should not wrap selection at boundaries when loop is false', async () => {
    container = mount(
      <RadioGroup defaultValue="small" orientation="horizontal" loop={false}>
        <RadioGroupItem value="small">Small</RadioGroupItem>
        <RadioGroupItem value="medium">Medium</RadioGroupItem>
      </RadioGroup>
    );

    const small = getRadioByText(container, 'Small');
    small.focus();
    small.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
    );
    await flushUpdates();

    expect(
      getRadioByText(container, 'Small').getAttribute('aria-checked')
    ).toBe('true');
    expect(
      getRadioByText(container, 'Medium').getAttribute('aria-checked')
    ).toBe('false');
  });

  it('should not activate disabled items during keyboard navigation attempts', async () => {
    container = mount(
      <RadioGroup defaultValue="small" orientation="vertical">
        <RadioGroupItem value="small">Small</RadioGroupItem>
        <RadioGroupItem value="medium" disabled>
          Medium
        </RadioGroupItem>
        <RadioGroupItem value="large">Large</RadioGroupItem>
      </RadioGroup>
    );

    const small = getRadioByText(container, 'Small');
    small.focus();
    small.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    small.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    await flushUpdates();

    expect(
      getRadioByText(container, 'Small').getAttribute('aria-checked')
    ).toBe('true');
    expect(
      getRadioByText(container, 'Medium').getAttribute('aria-checked')
    ).toBe('false');
    expect(
      getRadioByText(container, 'Large').getAttribute('aria-checked')
    ).toBe('false');
  });

  it('should isolate generated ids and roving focus between identical sibling groups', async () => {
    container = mount(
      <div>
        <RadioGroup defaultValue="small" orientation="vertical">
          <RadioGroupItem value="small">Small A</RadioGroupItem>
          <RadioGroupItem value="medium">Medium A</RadioGroupItem>
        </RadioGroup>
        <RadioGroup defaultValue="small" orientation="vertical">
          <RadioGroupItem value="small">Small A</RadioGroupItem>
          <RadioGroupItem value="medium">Medium A</RadioGroupItem>
        </RadioGroup>
      </div>
    );
    await flushUpdates();
    await flushUpdates();

    const groups = Array.from(
      container.querySelectorAll<HTMLElement>('[data-slot="radio-group"]')
    );
    const firstItems = Array.from(
      groups[0]!.querySelectorAll<HTMLElement>('[data-slot="radio-group-item"]')
    );
    const secondItems = Array.from(
      groups[1]!.querySelectorAll<HTMLElement>('[data-slot="radio-group-item"]')
    );

    expect(firstItems.map((item) => item.id)).not.toEqual(
      secondItems.map((item) => item.id)
    );

    firstItems[0]!.focus();
    await userEvent.keyboard('{ArrowDown}');
    await flushUpdates();

    expect(document.activeElement).toBe(firstItems[1]);
    expect(firstItems[1]!.getAttribute('aria-checked')).toBe('true');
    expect(secondItems[0]!.getAttribute('aria-checked')).toBe('true');
  });

  it('should repair focus when the focused item becomes disabled', async () => {
    let disabled!: ReturnType<typeof state<boolean>>;
    function DynamicRadioGroup() {
      disabled = state(false);
      return (
        <RadioGroup defaultValue="medium" orientation="vertical">
          <RadioGroupItem value="small">Small</RadioGroupItem>
          <RadioGroupItem value="medium" disabled={disabled()}>
            Medium
          </RadioGroupItem>
          <RadioGroupItem value="large">Large</RadioGroupItem>
        </RadioGroup>
      );
    }

    container = mount(<DynamicRadioGroup />);
    await flushUpdates();
    await flushUpdates();
    getRadioByText(container, 'Medium').focus();

    disabled.set(true);
    await flushUpdates();
    await flushUpdates();

    expect(document.activeElement).toBe(getRadioByText(container, 'Large'));
    expect(getRadioByText(container, 'Medium').getAttribute('tabindex')).toBe(
      '-1'
    );
  });

  it('should leave no disabled item focused when every item becomes disabled', async () => {
    let disabled!: ReturnType<typeof state<boolean>>;
    function AllDisabledRadioGroup() {
      disabled = state(false);
      return (
        <RadioGroup defaultValue="only">
          <RadioGroupItem value="only" disabled={disabled()}>
            Only
          </RadioGroupItem>
        </RadioGroup>
      );
    }

    container = mount(<AllDisabledRadioGroup />);
    await flushUpdates();
    const only = getRadioByText(container, 'Only');
    only.focus();

    disabled.set(true);
    await flushUpdates();
    await flushUpdates();

    expect(document.activeElement).not.toBe(only);
    expect(
      document.activeElement instanceof HTMLElement &&
        document.activeElement.hasAttribute('disabled')
    ).toBe(false);
  });
  it('should reverse horizontal arrow navigation under dir="rtl"', async () => {
    container = mount(
      <div dir="rtl">
        <RadioGroup orientation="horizontal" defaultValue="middle">
          <RadioGroupItem value="left">Left</RadioGroupItem>
          <RadioGroupItem value="middle">Middle</RadioGroupItem>
          <RadioGroupItem value="right">Right</RadioGroupItem>
        </RadioGroup>
      </div>
    );
    await flushUpdates();

    getRadioByText(container, 'Middle').focus();
    await userEvent.keyboard('{ArrowRight}');
    await flushUpdates();
    expect(document.activeElement).toBe(getRadioByText(container, 'Left'));

    await userEvent.keyboard('{ArrowLeft}');
    await flushUpdates();
    expect(document.activeElement).toBe(getRadioByText(container, 'Middle'));
  });
});
