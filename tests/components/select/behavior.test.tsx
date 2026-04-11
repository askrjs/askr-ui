import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../../../src/components/primitives/select';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Select - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('wires the hidden input and trigger expansion state', async () => {
    container = mount(
      <Select name="framework" defaultValue="askr">
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="askr">Askr</SelectItem>
            <SelectItem value="solid">Solid</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    );

    let trigger = container.querySelector(
      '[aria-haspopup="listbox"]'
    ) as HTMLButtonElement;
    const input = container.querySelector(
      'input[type="hidden"]'
    ) as HTMLInputElement;

    expect(input.value).toBe('askr');
    expect(trigger.textContent).toContain('Askr');

    trigger.click();
    await flushUpdates();
    trigger = container.querySelector(
      '[aria-haspopup="listbox"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('labels select groups through nested SelectLabel parts', async () => {
    container = mount(
      <Select defaultOpen defaultValue="askr">
        <SelectTrigger aria-label="Framework">
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Frameworks</SelectLabel>
              <SelectItem value="askr">Askr</SelectItem>
            </SelectGroup>
          </SelectContent>
        </SelectPortal>
      </Select>
    );

    await flushUpdates();

    const group = Array.from(document.body.querySelectorAll('[role="group"]'))[0] as HTMLElement;
    const label = group.querySelector('[data-select-label="true"]') as HTMLElement;

    expect(label.id).not.toBe('');
    expect(group.getAttribute('aria-labelledby')).toBe(label.id);
  });
});
