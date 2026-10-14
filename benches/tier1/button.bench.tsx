import { runBrowserBench } from '../tier4/browser-bench';
import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import {
  Button,
  type ButtonAsChildProps,
  type ButtonNativeProps,
} from '../../src/components/button';
describe('Button benches', () => {
  bench(
    'SSR render native <button>',
    () => {
      renderToStringSync(() => (
        <Button {...({ children: 'bench' } as unknown as ButtonNativeProps)} />
      ));
    },
    { throws: true }
  );
  bench(
    'SSR render with asChild and prop merging',
    () => {
      const child = <div />;
      renderToStringSync(() => (
        <Button
          {...({
            asChild: true,
            children: child,
            'data-test': 'ok',
            onPress: () => {},
          } as unknown as ButtonAsChildProps)}
        />
      ));
    },
    { throws: true }
  );
});
describe('Button benches - activation', () => {
  bench(
    'mount, activate, and clean up native button',
    async () => {
      let calls = 0;
      await runBrowserBench(
        <Button
          onPress={() => {
            calls += 1;
          }}
        >
          Activate
        </Button>,
        (container) => {
          const element = container.querySelector<HTMLElement>(
            '[data-slot="button"]'
          );
          if (!element) throw new Error('Missing mounted button host');
          element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          if (calls !== 1)
            throw new Error('Expected one button activation callback');
        }
      );
    },
    { throws: true }
  );
});
describe('Button benches - activation asChild', () => {
  bench(
    'mount, activate, and clean up asChild button',
    async () => {
      let calls = 0;
      await runBrowserBench(
        <Button
          asChild
          onPress={() => {
            calls += 1;
          }}
        >
          <div tabIndex={0}>Activate</div>
        </Button>,
        (container) => {
          const element = container.querySelector<HTMLElement>(
            '[data-slot="button"]'
          );
          if (!element) throw new Error('Missing mounted button host');
          element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          if (calls !== 1)
            throw new Error('Expected one button activation callback');
        }
      );
    },
    { throws: true }
  );
});
