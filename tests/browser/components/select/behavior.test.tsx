import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { state } from '@askrjs/askr';
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
} from '../../../../src/components/select';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Select - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    vi.useRealTimers();
    unmount(container);
  });

  it('should wire the hidden input and trigger expansion state', async () => {
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

  it('should render typed trigger size for themed select controls', () => {
    container = mount(
      <Select defaultValue="askr">
        <SelectTrigger size="sm">
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="askr">Askr</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    );

    const trigger = container.querySelector(
      '[aria-haspopup="listbox"]'
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('data-size')).toBe('sm');
  });

  it('should apply root disabled semantics to the trigger and hidden input', async () => {
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

  it('should move focus when the focused option becomes disabled', async () => {
    let disabled!: ReturnType<typeof state<boolean>>;
    function DynamicSelect() {
      disabled = state(false);
      return (
        <Select defaultOpen defaultValue="askr">
          <SelectTrigger>
            <SelectValue placeholder="Choose one" />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent>
              <SelectItem value="askr" disabled={disabled()}>
                Askr
              </SelectItem>
              <SelectItem value="solid">Solid</SelectItem>
            </SelectContent>
          </SelectPortal>
        </Select>
      );
    }

    container = mount(<DynamicSelect />);
    await flushUpdates();
    await flushUpdates();
    expect(document.activeElement?.textContent).toBe('Askr');

    disabled.set(true);
    await flushUpdates();
    await flushUpdates();

    expect(document.activeElement?.textContent).toBe('Solid');
  });

  it('should use explicit item text values for trigger rendering', () => {
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

  it('should label select groups through nested SelectLabel parts', async () => {
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

  it('should update hidden input and close content when an enabled item is selected', async () => {
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

  it('should not change value when clicking a disabled item', async () => {
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

  it('should keep all disabled select items unfocusable when navigation is attempted', async () => {
    container = mount(
      <Select defaultOpen defaultValue="askr">
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="askr" disabled>
              Askr
            </SelectItem>
            <SelectItem value="solid" disabled>
              Solid
            </SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    );

    await flushUpdates();
    await flushUpdates();

    const items = Array.from(
      document.body.querySelectorAll('[role="option"]')
    ) as HTMLElement[];

    expect(items).toHaveLength(2);
    expect(items.every((item) => item.getAttribute('tabindex') === '-1')).toBe(
      true
    );
  });

  it('should support buffered typeahead from the trigger and listbox focus', async () => {
    vi.useFakeTimers();
    container = mount(
      <Select name="database" defaultValue="alpha">
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent tabIndex={0}>
            <SelectItem value="alpha">Alpha</SelectItem>
            <SelectItem value="database-1" textValue="Database1" disabled>
              Disabled database
            </SelectItem>
            <SelectItem value="database-2" textValue="Database2">
              Primary database
            </SelectItem>
            <SelectItem value="database-archive" textValue="Database Archive">
              Archived database
            </SelectItem>
            <SelectItem value="delta">Delta</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    );

    let trigger = container.querySelector(
      '[data-slot="select-trigger"]'
    ) as HTMLButtonElement;
    trigger.focus();

    for (const key of 'database2') {
      trigger = container.querySelector(
        '[data-slot="select-trigger"]'
      ) as HTMLButtonElement;
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true,
        })
      );
      await flushUpdates();
    }

    expect(
      (container.querySelector('input[name="database"]') as HTMLInputElement)
        .value
    ).toBe('database-2');
    trigger = container.querySelector(
      '[data-slot="select-trigger"]'
    ) as HTMLButtonElement;
    expect(document.activeElement).toBe(trigger);

    trigger.click();
    await flushUpdates();
    await flushUpdates();

    let content = document.body.querySelector(
      '[data-slot="select-content"]'
    ) as HTMLElement;
    content.focus();

    const firstD = new KeyboardEvent('keydown', {
      key: 'D',
      bubbles: true,
      cancelable: true,
    });
    content.dispatchEvent(firstD);
    await flushUpdates();
    await flushUpdates();

    expect(firstD.defaultPrevented).toBe(true);
    expect(document.activeElement?.textContent?.trim()).toBe(
      'Archived database'
    );

    content = document.body.querySelector(
      '[data-slot="select-content"]'
    ) as HTMLElement;
    content.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'd',
        bubbles: true,
        cancelable: true,
      })
    );
    await flushUpdates();
    await flushUpdates();

    expect(document.activeElement?.textContent?.trim()).toBe('Delta');

    await vi.advanceTimersByTimeAsync(600);
    content = document.body.querySelector(
      '[data-slot="select-content"]'
    ) as HTMLElement;
    content.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'a',
        bubbles: true,
        cancelable: true,
      })
    );
    await flushUpdates();
    await flushUpdates();

    expect(document.activeElement?.textContent?.trim()).toBe('Alpha');

    await vi.advanceTimersByTimeAsync(600);
    for (const key of 'database archive') {
      const target = document.activeElement as HTMLElement;
      target.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true,
        })
      );
      await flushUpdates();
      (document.activeElement as HTMLElement).dispatchEvent(
        new KeyboardEvent('keyup', {
          key,
          bubbles: true,
          cancelable: true,
        })
      );
      await flushUpdates();
    }

    expect(document.activeElement?.textContent?.trim()).toBe(
      'Archived database'
    );
  });

  it('should keep arrow, Space, Enter, and Tab interactions intuitive', async () => {
    container = mount(
      <div>
        <Select name="framework" defaultValue="alpha">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent>
              <SelectItem value="alpha">Alpha</SelectItem>
              <SelectItem asChild value="beta">
                <span>Beta</span>
              </SelectItem>
            </SelectContent>
          </SelectPortal>
        </Select>
        <button type="button" data-testid="after-select">
          After select
        </button>
      </div>
    );

    let trigger = container.querySelector(
      '[data-slot="select-trigger"]'
    ) as HTMLButtonElement;
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await flushUpdates();
    await flushUpdates();

    trigger = container.querySelector(
      '[data-slot="select-trigger"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.textContent?.trim()).toBe('Alpha');

    await userEvent.keyboard('{ArrowDown}');
    await flushUpdates();
    await flushUpdates();
    expect(document.activeElement?.textContent?.trim()).toBe('Beta');

    await userEvent.keyboard(' ');
    await flushUpdates();

    expect(
      (container.querySelector('input[name="framework"]') as HTMLInputElement)
        .value
    ).toBe('beta');
    trigger = container.querySelector(
      '[data-slot="select-trigger"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await flushUpdates();
    await flushUpdates();
    trigger = container.querySelector(
      '[data-slot="select-trigger"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    await userEvent.keyboard('{Enter}');
    await flushUpdates();
    await flushUpdates();
    trigger = container.querySelector(
      '[data-slot="select-trigger"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('should open with Space and move past the popup with Tab', async () => {
    container = mount(
      <div>
        <Select defaultValue="alpha">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent>
              <SelectItem value="alpha">Alpha</SelectItem>
              <SelectItem value="beta">Beta</SelectItem>
            </SelectContent>
          </SelectPortal>
        </Select>
        <button type="button" data-testid="after-select">
          After select
        </button>
      </div>
    );

    let trigger = container.querySelector(
      '[data-slot="select-trigger"]'
    ) as HTMLButtonElement;
    trigger.focus();
    await userEvent.keyboard(' ');
    await flushUpdates();
    await flushUpdates();
    trigger = container.querySelector(
      '[data-slot="select-trigger"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    await userEvent.tab();
    await flushUpdates();
    await flushUpdates();

    trigger = container.querySelector(
      '[data-slot="select-trigger"]'
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(
      container.querySelector('[data-testid="after-select"]')
    );
  });

  it('should open an asChild trigger with Enter', async () => {
    container = mount(
      <Select defaultValue="alpha">
        <SelectTrigger asChild>
          <span>
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="alpha">Alpha</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    );

    let trigger = container.querySelector(
      '[data-slot="select-trigger"]'
    ) as HTMLElement;
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await flushUpdates();
    await flushUpdates();

    trigger = container.querySelector(
      '[data-slot="select-trigger"]'
    ) as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.textContent?.trim()).toBe('Alpha');
  });

  it('should throw when SelectContent is used without Select', () => {
    expect(() => {
      mount(
        <SelectPortal>
          <SelectContent>
            <SelectItem value="askr">Askr</SelectItem>
          </SelectContent>
        </SelectPortal>
      );
    }).toThrow('Select components must be used within <Select>');
  });

  it('should allow SelectItem when used within Select', () => {
    mount(
      <Select>
        <SelectTrigger>Open</SelectTrigger>
        <SelectPortal>
          <SelectItem value="askr">Askr</SelectItem>
        </SelectPortal>
      </Select>
    );

    const item = document.body.querySelector('[role="option"]');

    expect(item?.textContent).toBe('Askr');
  });

  it('should throw when SelectTrigger is used without Select', () => {
    expect(() => {
      mount(<SelectTrigger>Orphan</SelectTrigger>);
    }).toThrow('Select components must be used within <Select>');
  });
});
