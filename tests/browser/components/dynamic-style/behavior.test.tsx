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
  it('should retain every mounted rule when the bounded cache is full', () => {
    const nonce = 'YWN0aXZlLXJ1bGVzLXRlc3Q=';
    const targets: HTMLElement[] = [];
    const keys: string[] = [];

    try {
      for (let index = 0; index <= 512; index += 1) {
        const key = `active-rule:${index}`;
        const value = String(index);
        const selector = dynamicAttributeSelector('data-active-rule', value);
        const target = document.createElement('div');
        target.setAttribute('data-active-rule', value);
        document.body.appendChild(target);
        targets.push(target);
        keys.push(key);
        setDynamicStyleRule(key, selector, { height: `${index + 1}px` }, nonce);
      }

      const rules = Array.from(
        document.querySelectorAll<HTMLStyleElement>(
          'style[data-askr-dynamic-styles]'
        )
      ).find((style) => style.nonce === nonce)?.textContent;

      expect(rules).toContain('[data-active-rule="0"]');
      expect(rules).toContain('[data-active-rule="512"]');
    } finally {
      for (const target of targets) target.remove();
      for (const key of keys) removeDynamicStyleRule(key);
    }
  });

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
        document.querySelector('style[data-askr-dynamic-styles]')
          ?.textContent ?? ''
      ).not.toContain('--test-dynamic-value');
    } finally {
      target.remove();
      removeDynamicStyleRule(key);
    }
  });

  it('should reject selector and declaration breakout input', () => {
    expect(() => dynamicAttributeSelector('bad name', 'value')).toThrow(
      'Invalid dynamic style attribute'
    );
    const selector = dynamicAttributeSelector(
      'data-test',
      'x"]{} body{color:red'
    );
    expect(selector).toContain('\\"');
    expect(() =>
      setDynamicStyleRule('unsafe', selector, {
        '--value': '1; } body { color: red',
      })
    ).toThrow('Unsafe dynamic CSS value');
  });

  it('should isolate registries by nonce and remove empty registry elements', () => {
    const first = 'MDEyMzQ1Njc4OWFiY2RlZg';
    const second = 'ZmVkY2JhOTg3NjU0MzIxMA';
    setDynamicStyleRule('nonce:first', '.nonce-first', { color: 'red' }, first);
    setDynamicStyleRule(
      'nonce:second',
      '.nonce-second',
      { color: 'blue' },
      second
    );

    const styles = Array.from(
      document.querySelectorAll<HTMLStyleElement>(
        'style[data-askr-dynamic-styles]'
      )
    );
    expect(styles.some((style) => style.nonce === first)).toBe(true);
    expect(styles.some((style) => style.nonce === second)).toBe(true);
    expect(
      styles.find((style) => style.nonce === first)?.textContent
    ).not.toContain('.nonce-second');

    removeDynamicStyleRule('nonce:first');
    removeDynamicStyleRule('nonce:second');
    expect(
      Array.from(
        document.querySelectorAll<HTMLStyleElement>(
          'style[data-askr-dynamic-styles]'
        )
      ).filter((style) => style.nonce === first || style.nonce === second)
    ).toHaveLength(0);
  });
});
