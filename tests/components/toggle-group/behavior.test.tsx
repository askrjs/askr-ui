import { afterEach, describe, expect, it } from 'vitest';
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

describe('ToggleGroup - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('should support single and multiple selection', async () => {
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
