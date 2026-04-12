import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemText,
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

  it('applies root disabled semantics to the trigger and hidden input', async () => {
    container = mount(
      <Select disabled name="framework" defaultValue="askr">
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

    const trigger = container.querySelector(
      '[aria-haspopup="listbox"]'
    ) as HTMLButtonElement;
    const input = container.querySelector(
      'input[type="hidden"]'
    ) as HTMLInputElement;

    expect(trigger.disabled).toBe(true);
    expect(trigger.getAttribute('data-disabled')).toBe('true');
    expect(input.disabled).toBe(true);

    trigger.click();
    await flushUpdates();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('uses explicit item text values for trigger rendering', () => {
    container = mount(
      <Select defaultValue="askr">
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="askr" textValue="Askr">
              <SelectItemText>
                <span>Askr</span>
              </SelectItemText>
              <span aria-hidden="true"> Framework</span>
            </SelectItem>
            <SelectItem value="solid">Solid</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    );

    const trigger = container.querySelector(
      '[aria-haspopup="listbox"]'
    ) as HTMLButtonElement;

    expect(trigger.textContent).toBe('Askr');
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
              <div>
                <SelectLabel>Frameworks</SelectLabel>
              </div>
              <SelectItem value="askr">Askr</SelectItem>
            </SelectGroup>
          </SelectContent>
        </SelectPortal>
      </Select>
    );

    await flushUpdates();

    const group = Array.from(
      document.body.querySelectorAll('[role="group"]')
    )[0] as HTMLElement;
    const label = group.querySelector(
      '[data-select-label="true"]'
    ) as HTMLElement;

    expect(label.id).not.toBe('');
    expect(group.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('updates hidden input and closes content when an enabled item is selected', async () => {
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

    const trigger = container.querySelector(
      '[aria-haspopup="listbox"]'
    ) as HTMLButtonElement;
    trigger.click();
    await flushUpdates();

    const solidItem = Array.from(
      document.body.querySelectorAll('[data-slot="select-item"]')
    ).find((element) => element.textContent?.trim() === 'Solid') as HTMLElement;

    solidItem.click();
    await flushUpdates();

    const input = container.querySelector(
      'input[type="hidden"]'
    ) as HTMLInputElement;
    const nextTrigger = container.querySelector(
      '[aria-haspopup="listbox"]'
    ) as HTMLButtonElement;

    expect(input.value).toBe('solid');
    expect(nextTrigger.textContent).toContain('Solid');
    expect(nextTrigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('does not change value when clicking a disabled item', async () => {
    container = mount(
      <Select name="framework" defaultValue="askr">
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="askr">Askr</SelectItem>
            <SelectItem value="solid" disabled>
              Solid
            </SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    );

    const trigger = container.querySelector(
      '[aria-haspopup="listbox"]'
    ) as HTMLButtonElement;
    trigger.click();
    await flushUpdates();

    const disabledItem = Array.from(
      document.body.querySelectorAll('[data-slot="select-item"]')
    ).find((element) => element.textContent?.trim() === 'Solid') as HTMLElement;

    expect(disabledItem.getAttribute('aria-disabled')).toBe('true');
    disabledItem.click();
    await flushUpdates();

    const input = container.querySelector(
      'input[type="hidden"]'
    ) as HTMLInputElement;
    const nextTrigger = container.querySelector(
      '[aria-haspopup="listbox"]'
    ) as HTMLButtonElement;

    expect(input.value).toBe('askr');
    expect(nextTrigger.textContent).toContain('Askr');
  });
});
