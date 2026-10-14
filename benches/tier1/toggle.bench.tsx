import { runBrowserBench } from '../tier4/browser-bench';
import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import {
  Toggle,
  type ToggleAsChildProps,
  type ToggleButtonProps,
} from '../../src/components';
describe('Toggle benches', () => {
  bench(
    'SSR render native <button>',
    () => {
      renderToStringSync(() => (
        <Toggle {...({ children: 'bench' } as ToggleButtonProps)} />
      ));
    },
    { throws: true }
  );
  bench(
    'SSR render with pressed state',
    () => {
      renderToStringSync(() => (
        <Toggle
          {...({ children: 'bench', pressed: true } as ToggleButtonProps)}
        />
      ));
    },
    { throws: true }
  );
  bench(
    'SSR render with asChild and prop merging',
    () => {
      const child = <div />;
      renderToStringSync(() => (
        <Toggle
          {...({
            asChild: true,
            children: child,
            pressed: false,
            'data-test': 'ok',
            onPress: () => {},
          } as ToggleAsChildProps)}
        />
      ));
    },
    { throws: true }
  );
});
describe('Toggle benches - activation native', () => {
  bench(
    'mount, activate, and clean up native toggle',
    async () => {
      let calls = 0;
      await runBrowserBench(
        <Toggle
          onPress={() => {
            calls += 1;
          }}
        >
          Activate
        </Toggle>,
        (container) => {
          const element = container.querySelector<HTMLElement>(
            '[data-slot="toggle"]'
          );
          if (!element) throw new Error('Missing mounted toggle host');
          element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          if (calls !== 1)
            throw new Error('Expected one toggle activation callback');
        }
      );
    },
    { throws: true }
  );
});
describe('Toggle benches - activation asChild', () => {
  bench(
    'mount, activate, and clean up asChild toggle',
    async () => {
      let calls = 0;
      await runBrowserBench(
        <Toggle
          asChild
          onPress={() => {
            calls += 1;
          }}
        >
          <div tabIndex={0}>Activate</div>
        </Toggle>,
        (container) => {
          const element = container.querySelector<HTMLElement>(
            '[data-slot="toggle"]'
          );
          if (!element) throw new Error('Missing mounted toggle host');
          element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          if (calls !== 1)
            throw new Error('Expected one toggle activation callback');
        }
      );
    },
    { throws: true }
  );
});
