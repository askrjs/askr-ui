import { runBrowserBench } from '../tier4/browser-bench';
import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import {
  Checkbox,
  type CheckboxAsChildProps,
  type CheckboxInputProps,
} from '../../src/components';
describe('Checkbox benches - native', () => {
  bench(
    'SSR render native <input type="checkbox">',
    () => {
      renderToStringSync(() => <Checkbox {...({} as CheckboxInputProps)} />);
    },
    { throws: true }
  );
});
describe('Checkbox benches - checked', () => {
  bench(
    'SSR render with checked state',
    () => {
      renderToStringSync(() => (
        <Checkbox {...({ checked: true } as CheckboxInputProps)} />
      ));
    },
    { throws: true }
  );
});
describe('Checkbox benches - indeterminate', () => {
  bench(
    'SSR render with indeterminate state',
    () => {
      renderToStringSync(() => (
        <Checkbox
          {...({ checked: true, indeterminate: true } as CheckboxInputProps)}
        />
      ));
    },
    { throws: true }
  );
});
describe('Checkbox benches - asChild', () => {
  bench(
    'SSR render with asChild and prop merging',
    () => {
      const child = <div />;
      renderToStringSync(() => (
        <Checkbox
          {...({
            asChild: true,
            children: child,
            checked: false,
            'data-test': 'ok',
            onPress: () => {},
          } as CheckboxAsChildProps)}
        />
      ));
    },
    { throws: true }
  );
});
describe('Checkbox benches - activation native', () => {
  bench(
    'mount, activate, and clean up native checkbox',
    async () => {
      const changes: boolean[] = [];
      await runBrowserBench(
        <Checkbox
          onCheckedChange={(checked) => changes.push(checked)}
        ></Checkbox>,
        (container) => {
          const element = container.querySelector<HTMLElement>(
            '[data-slot="checkbox"]'
          );
          if (!element) throw new Error('Missing mounted checkbox host');
          element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          if (changes.length !== 1 || changes[0] !== true)
            throw new Error('Expected one checked-state activation callback');
        }
      );
    },
    { throws: true }
  );
});
describe('Checkbox benches - activation asChild', () => {
  bench(
    'mount, activate, and clean up asChild checkbox',
    async () => {
      const changes: boolean[] = [];
      await runBrowserBench(
        <Checkbox asChild onCheckedChange={(checked) => changes.push(checked)}>
          <div tabIndex={0}>Activate</div>
        </Checkbox>,
        (container) => {
          const element = container.querySelector<HTMLElement>(
            '[data-slot="checkbox"]'
          );
          if (!element) throw new Error('Missing mounted checkbox host');
          element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          if (changes.length !== 1 || changes[0] !== true)
            throw new Error('Expected one checked-state activation callback');
        }
      );
    },
    { throws: true }
  );
});
describe('Checkbox benches - checked transitions', () => {
  bench(
    'SSR render checked false/true/false variants',
    () => {
      renderToStringSync(() => (
        <Checkbox {...({ checked: false } as CheckboxInputProps)} />
      ));
      renderToStringSync(() => (
        <Checkbox {...({ checked: true } as CheckboxInputProps)} />
      ));
      renderToStringSync(() => (
        <Checkbox {...({ checked: false } as CheckboxInputProps)} />
      ));
    },
    { throws: true }
  );
});
describe('Checkbox benches - indeterminate transitions', () => {
  bench(
    'SSR render indeterminate variants',
    () => {
      renderToStringSync(() => (
        <Checkbox
          {...({ checked: false, indeterminate: false } as CheckboxInputProps)}
        />
      ));
      renderToStringSync(() => (
        <Checkbox
          {...({ checked: true, indeterminate: true } as CheckboxInputProps)}
        />
      ));
      renderToStringSync(() => (
        <Checkbox
          {...({ checked: true, indeterminate: false } as CheckboxInputProps)}
        />
      ));
    },
    { throws: true }
  );
});
