import {
  dynamicAttributeSelector,
  removeDynamicStyleRule,
  removeDynamicStyleRuleWhenUnused,
  setDynamicStyleRule,
} from '../../../../../src/components/_internal/dynamic-style';

/**
 * The dynamic style registry is a module, not a component, so each scenario
 * drives it directly in the page and reports what the document holds at each
 * step. The spec asserts on those observations.
 */

function settleMicrotask(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

function errorMessage(action: () => unknown): string | null {
  try {
    action();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

export function boundedCacheFull() {
  return {
    run: () => {
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
          setDynamicStyleRule(
            key,
            selector,
            { height: `${index + 1}px` },
            nonce
          );
        }

        return (
          Array.from(
            document.querySelectorAll<HTMLStyleElement>(
              'style[data-askr-dynamic-styles]'
            )
          ).find((style) => style.nonce === nonce)?.textContent ?? null
        );
      } finally {
        for (const target of targets) target.remove();
        for (const key of keys) removeDynamicStyleRule(key);
      }
    },
  };
}

export function refSwapThenUnmount() {
  return {
    run: async () => {
      const key = 'test:dynamic-style-ref-swap';
      const attr = 'data-dynamic-style-test';
      const selector = dynamicAttributeSelector(attr, 'target');
      const target = document.createElement('div');
      target.setAttribute(attr, 'target');
      document.body.appendChild(target);
      const readValue = () =>
        getComputedStyle(target)
          .getPropertyValue('--test-dynamic-value')
          .trim();

      try {
        setDynamicStyleRule(key, selector, { '--test-dynamic-value': '42%' });
        const afterSet = readValue();

        removeDynamicStyleRuleWhenUnused(key, selector);
        await settleMicrotask();
        const afterRefSwap = readValue();

        target.remove();
        removeDynamicStyleRuleWhenUnused(key, selector);
        await settleMicrotask();
        const rulesAfterUnmount =
          document.querySelector('style[data-askr-dynamic-styles]')
            ?.textContent ?? '';

        return { afterSet, afterRefSwap, rulesAfterUnmount };
      } finally {
        target.remove();
        removeDynamicStyleRule(key);
      }
    },
  };
}

export function breakoutInput() {
  return {
    run: () => {
      const invalidAttributeError = errorMessage(() =>
        dynamicAttributeSelector('bad name', 'value')
      );
      const selector = dynamicAttributeSelector(
        'data-test',
        'x"]{} body{color:red'
      );
      const unsafeValueError = errorMessage(() =>
        setDynamicStyleRule('unsafe', selector, {
          '--value': '1; } body { color: red',
        })
      );
      return { invalidAttributeError, selector, unsafeValueError };
    },
  };
}

export function nonceRegistries() {
  return {
    run: () => {
      const first = 'MDEyMzQ1Njc4OWFiY2RlZg';
      const second = 'ZmVkY2JhOTg3NjU0MzIxMA';
      setDynamicStyleRule(
        'nonce:first',
        '.nonce-first',
        { color: 'red' },
        first
      );
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
      const hasFirst = styles.some((style) => style.nonce === first);
      const hasSecond = styles.some((style) => style.nonce === second);
      const firstRules =
        styles.find((style) => style.nonce === first)?.textContent ?? null;

      removeDynamicStyleRule('nonce:first');
      removeDynamicStyleRule('nonce:second');
      const remaining = Array.from(
        document.querySelectorAll<HTMLStyleElement>(
          'style[data-askr-dynamic-styles]'
        )
      ).filter(
        (style) => style.nonce === first || style.nonce === second
      ).length;

      return { hasFirst, hasSecond, firstRules, remaining };
    },
  };
}
