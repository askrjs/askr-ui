import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../src/components/primitives/toggle-group';
import { TOGGLE_GROUP_A11Y_CONTRACT } from '../../../src/components/primitives/toggle-group/toggle-group.a11y';
import { flushUpdates, mount, unmount } from '../../test-utils';

function getToggleByText(container: HTMLElement, text: string): HTMLElement {
  const button = Array.from(
    container.querySelectorAll('[data-slot="toggle-group-item"]')
  ).find((element) => element.textContent?.trim() === text);

  if (!(button instanceof HTMLElement)) {
    throw new Error(`Unable to find toggle item with text "${text}"`);
  }

  return button;
}

describe('ToggleGroup - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('renders the group container and pressed hooks for single selection', () => {
    container = mount(
      <ToggleGroup defaultValue="left" orientation="vertical">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    );
    const group = container.querySelector('[data-slot="toggle-group"]');
    const left = getToggleByText(container, 'Left');
    const right = getToggleByText(container, 'Right');

    expect(group?.getAttribute('role')).toBe(
      TOGGLE_GROUP_A11Y_CONTRACT.GROUP_ROLE
    );
    expect(group?.getAttribute('data-orientation')).toBe('vertical');
    expect(group?.getAttribute('data-toggle-group')).toBe('true');
    expect(left.getAttribute('aria-pressed')).toBe('true');
    expect(left.getAttribute('data-state')).toBe('on');
    expect(right.getAttribute('aria-pressed')).toBe('false');
    expect(right.getAttribute('data-state')).toBe('off');
  });

  it('updates uncontrolled single selection and allows collapsing the active item', async () => {
    container = mount(
      <ToggleGroup defaultValue="left">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    );
    let left = getToggleByText(container, 'Left');
    let right = getToggleByText(container, 'Right');

    right.click();
    await flushUpdates();

    left = getToggleByText(container, 'Left');
    right = getToggleByText(container, 'Right');

    expect(left.getAttribute('aria-pressed')).toBe('false');
    expect(right.getAttribute('aria-pressed')).toBe('true');

    right.click();
    await flushUpdates();

    left = getToggleByText(container, 'Left');
    right = getToggleByText(container, 'Right');

    expect(left.getAttribute('aria-pressed')).toBe('false');
    expect(right.getAttribute('aria-pressed')).toBe('false');
  });

  it('updates uncontrolled multiple selection independently', async () => {
    container = mount(
      <ToggleGroup type="multiple" defaultValue={['left']}>
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    );
    let left = getToggleByText(container, 'Left');
    let right = getToggleByText(container, 'Right');

    right.click();
    await flushUpdates();

    left = getToggleByText(container, 'Left');
    right = getToggleByText(container, 'Right');

    expect(left.getAttribute('aria-pressed')).toBe('true');
    expect(right.getAttribute('aria-pressed')).toBe('true');

    left.click();
    await flushUpdates();

    left = getToggleByText(container, 'Left');
    right = getToggleByText(container, 'Right');

    expect(left.getAttribute('aria-pressed')).toBe('false');
    expect(right.getAttribute('aria-pressed')).toBe('true');
  });

  it('supports nested toggle items without relying on direct child injection', async () => {
    container = mount(
      <ToggleGroup defaultValue="left">
        <div>
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
        </div>
        <div>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </div>
      </ToggleGroup>
    );

    getToggleByText(container, 'Right').click();
    await flushUpdates();

    expect(
      getToggleByText(container, 'Left').getAttribute('aria-pressed')
    ).toBe('false');
    expect(
      getToggleByText(container, 'Right').getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('emits normalized values for single and multiple groups', async () => {
    const onSingleValueChange = vi.fn();
    const onMultipleValueChange = vi.fn();

    container = mount(
      <div>
        <ToggleGroup defaultValue="left" onValueChange={onSingleValueChange}>
          <ToggleGroupItem value="left">Single left</ToggleGroupItem>
          <ToggleGroupItem value="right">Single right</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup
          type="multiple"
          defaultValue={['left']}
          onValueChange={onMultipleValueChange}
        >
          <ToggleGroupItem value="left">Multiple left</ToggleGroupItem>
          <ToggleGroupItem value="right">Multiple right</ToggleGroupItem>
        </ToggleGroup>
      </div>
    );

    getToggleByText(container, 'Single right').click();
    await flushUpdates();
    getToggleByText(container, 'Single right').click();
    await flushUpdates();

    getToggleByText(container, 'Multiple right').click();
    await flushUpdates();
    getToggleByText(container, 'Multiple left').click();
    await flushUpdates();

    expect(onSingleValueChange.mock.calls).toEqual([['right'], ['']]);
    expect(onMultipleValueChange.mock.calls).toEqual([
      [['left', 'right']],
      [['right']],
    ]);
  });

  it('blocks interaction when the group or item is disabled', async () => {
    const onGroupValueChange = vi.fn();
    const onItemValueChange = vi.fn();

    container = mount(
      <div>
        <ToggleGroup
          disabled
          defaultValue="left"
          onValueChange={onGroupValueChange}
        >
          <ToggleGroupItem value="left">Group left</ToggleGroupItem>
          <ToggleGroupItem value="right">Group right</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup defaultValue="right" onValueChange={onItemValueChange}>
          <ToggleGroupItem value="left" disabled>
            Item left
          </ToggleGroupItem>
          <ToggleGroupItem value="right">Item right</ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
    const groupRight = getToggleByText(
      container,
      'Group right'
    ) as HTMLButtonElement;
    const itemLeft = getToggleByText(
      container,
      'Item left'
    ) as HTMLButtonElement;
    const itemRight = getToggleByText(container, 'Item right');

    expect(groupRight.disabled).toBe(true);
    expect(itemLeft.disabled).toBe(true);

    groupRight.click();
    itemLeft.click();
    await flushUpdates();

    expect(onGroupValueChange).not.toHaveBeenCalled();
    expect(onItemValueChange).not.toHaveBeenCalled();
    expect(itemRight.getAttribute('aria-pressed')).toBe('true');
  });

  it('supports asChild item composition and merges host props', () => {
    container = mount(
      <ToggleGroup defaultValue="left">
        <ToggleGroupItem
          asChild
          value="left"
          data-testid="toggle-item"
          data-from-toggle="yes"
        >
          <span data-from-child="yes">Left</span>
        </ToggleGroupItem>
      </ToggleGroup>
    );
    const host = getToggleByText(container, 'Left');

    expect(host.getAttribute('role')).toBe(
      TOGGLE_GROUP_A11Y_CONTRACT.ITEM_ROLE
    );
    expect(host.getAttribute('data-testid')).toBe('toggle-item');
    expect(host.getAttribute('data-from-toggle')).toBe('yes');
    expect(host.getAttribute('data-from-child')).toBe('yes');
    expect(host.getAttribute('aria-pressed')).toBe('true');
    expect(host.getAttribute('data-state')).toBe('on');
  });

  it('forwards refs to the group container and item hosts', () => {
    let groupRef: HTMLDivElement | null = null;
    let nativeItemRef: HTMLButtonElement | null = null;
    let childItemRef: HTMLElement | null = null;

    container = mount(
      <ToggleGroup ref={(node) => (groupRef = node)} defaultValue="left">
        <ToggleGroupItem ref={(node) => (nativeItemRef = node)} value="left">
          Left
        </ToggleGroupItem>
      </ToggleGroup>
    );
    const group = container.querySelector(
      '[data-slot="toggle-group"]'
    ) as HTMLDivElement | null;
    const nativeItem = getToggleByText(container, 'Left') as HTMLButtonElement;

    expect(groupRef).toBe(group);
    expect(nativeItemRef).toBe(nativeItem);

    unmount(container);
    container = mount(
      <ToggleGroup defaultValue="left">
        <ToggleGroupItem
          asChild
          ref={(node) => (childItemRef = node as HTMLElement | null)}
          value="left"
        >
          <span>Left</span>
        </ToggleGroupItem>
      </ToggleGroup>
    );
    const childHost = getToggleByText(container, 'Left');

    expect(childItemRef).toBe(childHost);
  });

  it('treats value as controlled state when provided', async () => {
    const onValueChange = vi.fn();

    container = mount(
      <ToggleGroup value="left" onValueChange={onValueChange}>
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    );
    getToggleByText(container, 'Right').click();
    await flushUpdates();

    expect(onValueChange).toHaveBeenCalledWith('right');
    expect(
      getToggleByText(container, 'Left').getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      getToggleByText(container, 'Right').getAttribute('aria-pressed')
    ).toBe('false');
  });

  it('does not wrap roving focus at boundaries when loop is false', async () => {
    container = mount(
      <ToggleGroup defaultValue="left" orientation="horizontal" loop={false}>
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    );

    const left = getToggleByText(container, 'Left');
    left.focus();
    left.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
    );
    await flushUpdates();

    expect(document.activeElement).toBe(getToggleByText(container, 'Left'));
  });

  it('does not activate disabled items during roving keyboard navigation attempts', async () => {
    container = mount(
      <ToggleGroup defaultValue="left" orientation="vertical">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="middle" disabled>
          Middle
        </ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    );

    const left = getToggleByText(container, 'Left');
    left.focus();
    left.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    left.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    await flushUpdates();

    expect(
      getToggleByText(container, 'Left').getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      getToggleByText(container, 'Right').getAttribute('aria-pressed')
    ).toBe('false');
    expect(
      getToggleByText(container, 'Middle').getAttribute('aria-pressed')
    ).toBe('false');
  });
});
