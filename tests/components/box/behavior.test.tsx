import { afterEach, describe, expect, it } from 'vite-plus/test';
import { Box } from '../../../src/components/primitives/box/box';
import { mount, unmount } from '../../test-utils';

describe('Box - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    if (container) unmount(container);
  });

  it('should render the box data-slot', () => {
    container = mount(<Box />);
    expect(container.querySelector('[data-slot="box"]')).not.toBeNull();
  });

  it('should serialize responsive spacing props into layout custom properties', () => {
    container = mount(<Box p={{ initial: '2', md: '4' }} />);
    const el = container.querySelector('[data-slot="box"]') as HTMLElement;
    expect(el.style.getPropertyValue('--ak-p-initial')).toBe(
      'var(--ak-space-2)'
    );
    expect(el.style.getPropertyValue('--ak-p-md')).toBe('var(--ak-space-4)');
  });

  it('should support polymorphic rendering', () => {
    container = mount(<Box as="span">inline</Box>);
    expect(container.querySelector('span[data-slot="box"]')).not.toBeNull();
  });
});
