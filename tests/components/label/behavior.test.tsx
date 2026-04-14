import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createIsland } from '@askrjs/askr';
import { Label } from '../../../src/components/primitives/label/label';

describe('Label - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('renders a native label by default', () => {
    container = mount(<Label htmlFor="email">Email</Label>);
    const label = container.querySelector('label') as HTMLLabelElement | null;

    expect(label).toBeTruthy();
    expect(label?.textContent).toBe('Email');
    expect(label?.getAttribute('for')).toBe('email');
    expect(label?.getAttribute('data-slot')).toBe('label');
  });

  it('supports asChild composition and merges host props', () => {
    container = mount(
      <Label asChild data-testid="email-label" data-from-label="yes">
        <span data-from-child="yes">Email</span>
      </Label>
    );
    const span = container.querySelector('span');

    expect(span?.textContent).toBe('Email');
    expect(span?.getAttribute('data-testid')).toBe('email-label');
    expect(span?.getAttribute('data-from-label')).toBe('yes');
    expect(span?.getAttribute('data-from-child')).toBe('yes');
    expect(span?.getAttribute('data-slot')).toBe('label');
  });
});
