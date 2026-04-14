import { afterEach, describe, expect, it } from 'vite-plus/test';
import { Separator } from '../../../src/components/primitives/separator/separator';
import { mount, unmount } from '../../test-utils';

describe('Separator - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('renders semantic separator markup by default', () => {
    container = mount(<Separator />);

    const separator = container.querySelector('div');

    expect(separator).toBeTruthy();
    expect(separator?.getAttribute('role')).toBe('separator');
    expect(separator?.getAttribute('aria-orientation')).toBe('horizontal');
    expect(separator?.getAttribute('data-orientation')).toBe('horizontal');
    expect(separator?.getAttribute('data-slot')).toBe('separator');
  });

  it('supports vertical orientation hooks', () => {
    container = mount(<Separator orientation="vertical" />);

    const separator = container.querySelector('div');

    expect(separator?.getAttribute('aria-orientation')).toBe('vertical');
    expect(separator?.getAttribute('data-orientation')).toBe('vertical');
  });

  it('renders decorative separators as presentation', () => {
    container = mount(<Separator decorative />);

    const separator = container.querySelector('div');

    expect(separator?.getAttribute('role')).toBe('presentation');
    expect(separator?.hasAttribute('aria-orientation')).toBe(false);
  });

  it('supports asChild composition and merges host props', () => {
    container = mount(
      <Separator
        asChild
        orientation="vertical"
        data-testid="custom-separator"
        data-from-separator="yes"
      >
        <div data-from-child="yes" />
      </Separator>
    );

    const separator = container.querySelector('div');

    expect(separator?.getAttribute('data-testid')).toBe('custom-separator');
    expect(separator?.getAttribute('data-from-separator')).toBe('yes');
    expect(separator?.getAttribute('data-from-child')).toBe('yes');
    expect(separator?.getAttribute('role')).toBe('separator');
    expect(separator?.getAttribute('data-orientation')).toBe('vertical');
  });
});
