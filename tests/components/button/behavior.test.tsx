import { describe, it, expect, vi, afterEach } from 'vite-plus/test';
import { Button } from '../../../src/components/primitives/button/button';
import { createIsland } from '@askrjs/askr';

function mount(element: JSX.Element): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  createIsland({
    root: container,
    component: () => element,
  });
  return container;
}

function unmount(container: HTMLElement) {
  if (container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

describe('Button - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('renders a native button by default', () => {
    container = mount(<Button>Save</Button>);
    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

      container = mount(<Button onPress={onPress}>Click me</Button>);
      const button = container.querySelector('button') as HTMLButtonElement;

      button.click();
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should delegate keyboard interaction to foundation given asChild element', () => {
      const onPress = vi.fn();

      container = mount(
        <Button asChild onPress={onPress}>
          <div role="button">Custom</div>
        </Button>
      );

      const element = container.querySelector('[role="button"]') as HTMLElement;

      element.click();
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should delegate disabled semantics to foundation given no manual checks in component', () => {
      const onPress = vi.fn();

      container = mount(
        <Button disabled onPress={onPress}>
          Click me
        </Button>
      );
      const button = container.querySelector('button') as HTMLButtonElement;

      expect(button.disabled).toBe(true);
      button.click();
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should delegate disabled semantics for asChild elements given aria-disabled comes from foundation', () => {
      const onPress = vi.fn();

      container = mount(
        <Button asChild disabled onPress={onPress}>
          <a href="/test">Link</a>
        </Button>
      );

      const link = container.querySelector('a') as HTMLAnchorElement;

      expect(link.getAttribute('aria-disabled')).toBe('true');
      expect(link.getAttribute('tabindex')).toBe('-1');

      link.click();
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should compose props using mergeProps foundation given no manual spreading', () => {
      const onPress = vi.fn();

      container = mount(
        <Button onPress={onPress} data-custom="value" aria-label="test">
          Click me
        </Button>
      );

      const button = container.querySelector('button') as HTMLButtonElement;

      expect(button.getAttribute('data-custom')).toBe('value');
      expect(button.getAttribute('aria-label')).toBe('test');

      button.click();
      expect(onPress).toHaveBeenCalled();
    });
  });

  // ========================================
  // SEMANTIC CONTRACT
  // ========================================
  describe('semantic contract', () => {
    it('should render a native button element given no asChild prop', () => {
      container = mount(<Button>Click me</Button>);
      const button = container.querySelector('button') as HTMLButtonElement;

      expect(button).toBeTruthy();
      expect(button.tagName).toBe('BUTTON');
      expect(button.textContent).toBe('Click me');
    });

    it('should render with button type by default given no type prop', () => {
      container = mount(<Button>Click me</Button>);
      const button = container.querySelector('button') as HTMLButtonElement;

      expect(button.getAttribute('type')).toBe('button');
    });

    it('should render with submit type given type="submit"', () => {
      container = mount(<Button type="submit">Submit</Button>);
      const button = container.querySelector('button') as HTMLButtonElement;

      expect(button.getAttribute('type')).toBe('submit');
    });

    it('should render with reset type given type="reset"', () => {
      container = mount(<Button type="reset">Reset</Button>);
      const button = container.querySelector('button') as HTMLButtonElement;

      expect(button.getAttribute('type')).toBe('reset');
    });

    it('should respond to onPress given user interaction', () => {
      const onPress = vi.fn();
      container = mount(<Button onPress={onPress}>Click me</Button>);

      const button = container.querySelector('button')!;
      button.click();

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should prevent interaction when disabled given disabled prop', () => {
      const onPress = vi.fn();
      container = mount(
        <Button disabled onPress={onPress}>
          Click me
        </Button>
      );

      const button = container.querySelector('button')!;
      button.click();

      expect(onPress).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // asChild INVARIANT
  // ========================================
  describe('asChild invariant', () => {
    it('should render child element given asChild prop', () => {
      container = mount(
        <Button asChild>
          <a href="/test">Link</a>
        </Button>
      );
      const link = container.querySelector('a') as HTMLAnchorElement;

      expect(link).toBeTruthy();
      expect(link.tagName).toBe('A');
      expect(link.getAttribute('href')).toBe('/test');
      expect(link.textContent).toBe('Link');
    });

    it('should preserve interaction semantics given asChild with different host element', () => {
      const onPress = vi.fn();
      container = mount(
        <Button asChild onPress={onPress}>
          <a href="/test">Link</a>
        </Button>
      );

      const link = container.querySelector('a') as HTMLAnchorElement;
      link.click();

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should preserve disabled semantics given asChild element', () => {
      const onPress = vi.fn();
      container = mount(
        <Button asChild disabled onPress={onPress}>
          <a href="/test">Link</a>
        </Button>
      );

      const link = container.querySelector('a')!;

      expect(link.getAttribute('aria-disabled')).toBe('true');
      expect(link.getAttribute('tabindex')).toBe('-1');

      link.click();
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should forward additional props given asChild with extra attributes', () => {
      container = mount(
        <Button asChild data-testid="custom-link">
          <a href="/test">Link</a>
        </Button>
      );
      const link = container.querySelector(
        '[data-testid="custom-link"]'
      ) as HTMLAnchorElement;

      expect(link).toBeTruthy();
      expect(link.tagName).toBe('A');
    });

    it('should work with div given asChild with non-semantic element', () => {
      const onPress = vi.fn();
      container = mount(
        <Button asChild onPress={onPress}>
          <div>Custom Button</div>
        </Button>
      );

      const div = container.querySelector('div') as HTMLElement;
      div.click();

      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  it('invokes onPress exactly once per native click', () => {
    const onPress = vi.fn();

    container = mount(<Button onPress={onPress}>Save</Button>);
    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

      const button = container.querySelector('button') as HTMLButtonElement;

      expect(button.getAttribute('data-testid')).toBe('test');
      expect(button.getAttribute('class')).toBe('custom');

      button.click();
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not double-fire events given proper handler composition', () => {
      const onPress = vi.fn();
      container = mount(<Button onPress={onPress}>Click me</Button>);

      const button = container.querySelector('button') as HTMLButtonElement;
      button.click();

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should compose with asChild element props given no conflicts', () => {
      const onPress = vi.fn();

      container = mount(
        <Button asChild onPress={onPress} data-from-button="yes">
          <a href="/test" data-from-child="yes">
            Link
          </a>
        </Button>
      );

      const link = container.querySelector('a') as HTMLAnchorElement;

      expect(link.getAttribute('data-from-button')).toBe('yes');
      expect(link.getAttribute('data-from-child')).toBe('yes');
      expect(link.getAttribute('href')).toBe('/test');

      link.click();
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  it('blocks native interaction when disabled', () => {
    const onPress = vi.fn();

      container = mount(
        <Button onClick={onClick} onPress={onPress}>
          Click me
        </Button>
      );

    expect(button?.disabled).toBe(true);
    button?.click();

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not allow disabled bypass given foundation enforces it', () => {
      const onPress = vi.fn();
      container = mount(
        <Button disabled onPress={onPress}>
          Click me
        </Button>
      );

      const button = container.querySelector('button')! as HTMLButtonElement;

      button.click();
      button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

      expect(onPress).not.toHaveBeenCalled();
    });

    it('should not fire onPress given disabled asChild element with any interaction', () => {
      const onPress = vi.fn();
      container = mount(
        <Button asChild disabled onPress={onPress}>
          <div role="button" tabIndex={0}>
            Custom
          </div>
        </Button>
      );

      const element = container.querySelector('[role="button"]') as HTMLElement;

      element.click();
      element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

      expect(onPress).not.toHaveBeenCalled();
    });
  });

  it('supports asChild composition and merges host props', () => {
    container = mount(
      <Button asChild data-from-button="yes" data-testid="docs-link">
        <a href="/docs" data-from-child="yes">
          Docs
        </a>
      </Button>
    );
    const link = container.querySelector('a') as HTMLAnchorElement | null;

      container = mount(<Button onPress={onPress}>Click me</Button>);
      const button = container.querySelector('button') as HTMLButtonElement;

  it('routes interaction through the asChild host element', () => {
    const onPress = vi.fn();

    container = mount(
      <Button asChild onPress={onPress}>
        <div role="button">Custom</div>
      </Button>
    );
    const element = container.querySelector(
      '[role="button"]'
    ) as HTMLElement | null;

    element?.click();

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies disabled semantics to asChild hosts', () => {
    const onPress = vi.fn();

    container = mount(
      <Button asChild disabled onPress={onPress}>
        <a href="/docs">Docs</a>
      </Button>
    );
    const link = container.querySelector('a') as HTMLAnchorElement | null;

    expect(link?.getAttribute('aria-disabled')).toBe('true');
    expect(link?.getAttribute('tabindex')).toBe('-1');

    link?.click();

    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not double-fire press handlers during composed native clicks', () => {
    const onPress = vi.fn();

    container = mount(
      <Button onPress={onPress} data-testid="primary-action" className="cta">
        Save
      </Button>
    );
    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(button?.getAttribute('data-testid')).toBe('primary-action');
    expect(button?.className).toBe('cta');

    button?.click();

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
