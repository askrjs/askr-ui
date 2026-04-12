import { afterEach, describe, expect, it } from 'vite-plus/test';
import { Flex } from '../../../src/components/primitives/flex/flex';
import { FLEX_A11Y_CONTRACT } from '../../../src/components/primitives/flex/flex.a11y';
import { mount, unmount } from '../../test-utils';

describe('Flex - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    if (container) unmount(container);
  });

  it('should render the flex data-slot', () => {
    container = mount(<Flex />);
    expect(container.querySelector('[data-slot="flex"]')).not.toBeNull();
  });

  it('should render as a div by default', () => {
    container = mount(<Flex />);
    expect(container.querySelector('div[data-slot="flex"]')).not.toBeNull();
  });

  it('should pass through className', () => {
    container = mount(<Flex className="my-flex" />);
    const el = container.querySelector('[data-slot="flex"]');
    expect(el?.classList.contains('my-flex')).toBe(true);
  });

  it('should default direction to row', () => {
    container = mount(<Flex />);
    const el = container.querySelector('[data-slot="flex"]');
    expect(el?.getAttribute(FLEX_A11Y_CONTRACT.DATA_ATTRIBUTES.direction)).toBe('row');
  });

  it('should emit data-direction attribute when set to column', () => {
    container = mount(<Flex direction="column" />);
    const el = container.querySelector('[data-slot="flex"]');
    expect(el?.getAttribute(FLEX_A11Y_CONTRACT.DATA_ATTRIBUTES.direction)).toBe('column');
  });

  it('should emit data-gap attribute', () => {
    container = mount(<Flex gap="1rem" />);
    const el = container.querySelector('[data-slot="flex"]');
    expect(el?.getAttribute(FLEX_A11Y_CONTRACT.DATA_ATTRIBUTES.gap)).toBe('1rem');
  });

  it('should set gap inline style for valid CSS lengths', () => {
    container = mount(<Flex gap="1rem" />);
    const el = container.querySelector('[data-slot="flex"]') as HTMLElement;
    expect(el.style.gap).toBe('1rem');
  });

  it('should emit data-align attribute', () => {
    container = mount(<Flex align="center" />);
    const el = container.querySelector('[data-slot="flex"]');
    expect(el?.getAttribute(FLEX_A11Y_CONTRACT.DATA_ATTRIBUTES.align)).toBe('center');
  });

  it('should emit data-justify attribute', () => {
    container = mount(<Flex justify="space-between" />);
    const el = container.querySelector('[data-slot="flex"]');
    expect(el?.getAttribute(FLEX_A11Y_CONTRACT.DATA_ATTRIBUTES.justify)).toBe('space-between');
  });

  it('should emit data-wrap attribute', () => {
    container = mount(<Flex wrap="wrap" />);
    const el = container.querySelector('[data-slot="flex"]');
    expect(el?.getAttribute(FLEX_A11Y_CONTRACT.DATA_ATTRIBUTES.wrap)).toBe('wrap');
  });

  it('should emit data-collapse-below attribute', () => {
    container = mount(<Flex collapseBelow="sm" />);
    const el = container.querySelector('[data-slot="flex"]');
    expect(el?.getAttribute(FLEX_A11Y_CONTRACT.DATA_ATTRIBUTES.collapseBelow)).toBe('sm');
  });

  it('should render the child element when asChild is true', () => {
    container = mount(
      <Flex asChild>
        <nav>content</nav>
      </Flex>
    );
    const el = container.querySelector('nav');
    expect(el?.getAttribute('data-slot')).toBe('flex');
  });
});
