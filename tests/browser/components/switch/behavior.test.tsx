import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { Switch } from '../../../../src/components/switch/switch';
import { mount, unmount } from '../../test-utils';
import { flushUpdates } from '../../test-utils';

describe('Switch - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should render native switch semantics by default', () => {
    container = mount(<Switch>Airplane mode</Switch>);
    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(button).toBeTruthy();
    expect(button?.type).toBe('button');
    expect(button?.getAttribute('role')).toBe('switch');
    expect(button?.getAttribute('aria-checked')).toBe('false');
    expect(button?.getAttribute('aria-pressed')).toBeNull();
    expect(button?.getAttribute('data-slot')).toBe('switch');
    expect(button?.getAttribute('data-state')).toBe('unchecked');
  });

  it('should preserve an explicit native button type and checked state hooks', () => {
    container = mount(
      <Switch type="submit" checked>
        Publish
      </Switch>
    );
    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(button?.type).toBe('submit');
    expect(button?.getAttribute('aria-checked')).toBe('true');
    expect(button?.getAttribute('data-state')).toBe('checked');
  });

  it('should emit uncontrolled state changes through onCheckedChange', async () => {
    const onCheckedChange = vi.fn();

    container = mount(
      <Switch defaultChecked={false} onCheckedChange={onCheckedChange}>
        Airplane mode
      </Switch>
    );
    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(button?.getAttribute('aria-checked')).toBe('false');

    button?.click();
    await flushUpdates();

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('should call onCheckedChange in controlled mode', () => {
    const onCheckedChange = vi.fn();

    container = mount(
      <Switch checked={false} onCheckedChange={onCheckedChange}>
        Power
      </Switch>
    );
    const button = container.querySelector('button')!;
    button.click();

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('should render hidden form input when named', () => {
    container = mount(
      <Switch name="notifications" defaultChecked value="enabled">
        Notifications
      </Switch>
    );

    const input = container.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement | null;

    expect(input?.hidden).toBe(true);
    expect(input?.getAttribute('aria-hidden')).toBe('true');
    expect(input?.tabIndex).toBe(-1);
    expect(input?.name).toBe('notifications');
    expect(input?.value).toBe('enabled');
    expect(input?.checked).toBe(true);
  });

  it('should keep the hidden form input in sync after uncontrolled presses', async () => {
    container = mount(
      <Switch name="notifications" defaultChecked={false}>
        Notifications
      </Switch>
    );

    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;
    const input = container.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement | null;

    expect(button?.getAttribute('aria-checked')).toBe('false');
    expect(input?.checked).toBe(false);

    button?.click();
    await flushUpdates();

    const updatedButton = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;
    const updatedInput = container.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement | null;

    expect(updatedButton?.getAttribute('aria-checked')).toBe('true');
    expect(updatedButton?.getAttribute('data-state')).toBe('checked');
    expect(updatedInput?.checked).toBe(true);
  });

  it('should support asChild composition and merge host props', () => {
    container = mount(
      <Switch
        asChild
        defaultChecked
        data-testid="power-switch"
        data-from-switch="yes"
      >
        <div data-from-child="yes">Power</div>
      </Switch>
    );
    const host = container.querySelector('[role="switch"]');

    expect(host?.textContent).toBe('Power');
    expect(host?.getAttribute('data-testid')).toBe('power-switch');
    expect(host?.getAttribute('data-from-switch')).toBe('yes');
    expect(host?.getAttribute('data-from-child')).toBe('yes');
    expect(host?.getAttribute('role')).toBe('switch');
    expect(host?.getAttribute('aria-checked')).toBe('true');
    expect(host?.getAttribute('data-state')).toBe('checked');
  });

  it('should toggle an asChild host with Enter and Space', async () => {
    const onCheckedChange = vi.fn();
    container = mount(
      <Switch asChild onCheckedChange={onCheckedChange}>
        <span>Power</span>
      </Switch>
    );

    let host = container.querySelector('[role="switch"]') as HTMLElement;
    host.focus();
    await userEvent.keyboard('{Enter}');
    await flushUpdates();

    host = container.querySelector('[role="switch"]') as HTMLElement;
    expect(host.getAttribute('aria-checked')).toBe('true');

    host.focus();
    await userEvent.keyboard(' ');
    await flushUpdates();

    host = container.querySelector('[role="switch"]') as HTMLElement;
    expect(host.getAttribute('aria-checked')).toBe('false');
    expect(onCheckedChange.mock.calls).toEqual([[true], [false]]);
  });

  it('should apply disabled semantics to asChild hosts', () => {
    const onCheckedChange = vi.fn();

    container = mount(
      <Switch asChild disabled onCheckedChange={onCheckedChange}>
        <div>Power</div>
      </Switch>
    );
    const host = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement | null;

    expect(host?.getAttribute('aria-disabled')).toBe('true');
    expect(host?.getAttribute('tabindex')).toBe('-1');
    expect(host?.getAttribute('data-disabled')).toBe('true');

    host?.click();

    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('should forward refs to native and asChild hosts', () => {
    let nativeRef: HTMLButtonElement | null = null;
    let childRef: HTMLElement | null = null;

    container = mount(
      <Switch ref={(node) => (nativeRef = node)}>Power</Switch>
    );
    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(nativeRef).toBe(button);

    unmount(container);
    container = mount(
      <Switch asChild ref={(node) => (childRef = node as HTMLElement | null)}>
        <div>Power</div>
      </Switch>
    );
    const host = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement | null;

    expect(childRef).toBe(host);
  });
});
