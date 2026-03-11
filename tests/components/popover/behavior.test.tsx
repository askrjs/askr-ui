import { afterEach, describe, expect, it } from 'vitest';
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../../src/components/popover';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Popover - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('toggles trigger expansion state through the trigger', async () => {
    container = mount(
      <Popover>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>Details</PopoverContent>
        </PopoverPortal>
      </Popover>
    );

    let trigger = container.querySelector('[aria-haspopup="dialog"]')!;
    trigger.click();
    await flushUpdates();
    trigger = container.querySelector('[aria-haspopup="dialog"]')!;

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    trigger.click();
    await flushUpdates();
    trigger = container.querySelector('[aria-haspopup="dialog"]')!;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
