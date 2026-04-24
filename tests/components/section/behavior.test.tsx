import { afterEach, describe, expect, it } from 'vite-plus/test';
import { Section } from '../../../src/components/primitives/section/section';
import { mount, unmount } from '../../test-utils';

describe('Section - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    if (container) unmount(container);
  });

  it('should render the section data-slot', () => {
    container = mount(<Section />);
    expect(
      container.querySelector('section[data-slot="section"]')
    ).not.toBeNull();
  });

  it('should serialize themed section spacing via the shared layout contract', () => {
    container = mount(<Section size="2" />);
    const el = container.querySelector('[data-slot="section"]') as HTMLElement;
    expect(el.getAttribute('data-size')).toBe('initial:2');
    expect(el.style.getPropertyValue('--ak-py-initial')).toBe(
      'var(--ak-section-2)'
    );
  });

  it('should render the child element when asChild is true', () => {
    container = mount(
      <Section asChild>
        <article>content</article>
      </Section>
    );
    const el = container.querySelector('article');
    expect(el?.getAttribute('data-slot')).toBe('section');
  });
});
