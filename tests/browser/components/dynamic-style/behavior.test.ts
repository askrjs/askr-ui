import { describe, expect, it } from 'vite-plus/test';
import {
  dynamicAttributeSelector,
  removeDynamicStyleRule,
  removeDynamicStyleRuleWhenUnused,
  setDynamicStyleRule,
} from '../../../../src/components/_internal/dynamic-style';

function settleMicrotask(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

describe('dynamic style rules', () => {
  it('should keep rules during ref swaps and remove them after unmount', async () => {
    const key = 'test:dynamic-style-ref-swap';
    const attr = 'data-dynamic-style-test';
    const selector = dynamicAttributeSelector(attr, 'target');
    const target = document.createElement('div');
    target.setAttribute(attr, 'target');
    document.body.appendChild(target);

    try {
      setDynamicStyleRule(key, selector, { '--test-dynamic-value': '42%' });

      expect(
        getComputedStyle(target).getPropertyValue('--test-dynamic-value').trim()
      ).toBe('42%');

      removeDynamicStyleRuleWhenUnused(key, selector);
      await settleMicrotask();

      expect(
        getComputedStyle(target).getPropertyValue('--test-dynamic-value').trim()
      ).toBe('42%');

      target.remove();
      removeDynamicStyleRuleWhenUnused(key, selector);
      await settleMicrotask();

      expect(
        document.querySelector('style[data-askr-dynamic-styles]')?.textContent
      ).not.toContain('--test-dynamic-value');
    } finally {
      target.remove();
      removeDynamicStyleRule(key);
    }
  });
});
