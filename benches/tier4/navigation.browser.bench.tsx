import { bench, describe } from 'vite-plus/test';
import { Menu, MenuContent, MenuItem } from '../../src/components/menu';
import { getTabbableElements } from '../../src/components/_internal/focus';
import {
  createTier4BenchOptions,
  flushBrowserBenchUpdates,
  runBrowserBench,
} from './browser-bench';

const itemCount = 200;
const navigationBenchOptions = createTier4BenchOptions({
  time: 1000,
  warmupTime: 250,
});

describe('Focus-order traversal benches', () => {
  bench(
    'flatten 1k mixed light and shadow focus stops',
    () => {
      const root = document.createElement('div');
      for (let index = 0; index < 1000; index += 1) {
        if (index % 10 === 0) {
          const host = document.createElement('div');
          host.attachShadow({ mode: 'open' }).innerHTML =
            '<button>Shadow stop</button>';
          root.append(host);
        } else {
          const button = document.createElement('button');
          button.textContent = `Stop ${index}`;
          root.append(button);
        }
      }
      document.body.append(root);
      getTabbableElements(root);
      root.remove();
    },
    navigationBenchOptions
  );
});

describe('Typeahead benches', () => {
  bench(
    'match within a 200-item rendered menu',
    async () => {
      await runBrowserBench(
        <Menu>
          <MenuContent>
            {Array.from({ length: itemCount }, (_, index) => (
              <MenuItem
                key={index}
                index={index}
                textValue={`Database ${index}`}
              >
                Database {index}
              </MenuItem>
            ))}
          </MenuContent>
        </Menu>,
        async (container) => {
          const menu = container.querySelector('[role="menu"]') as HTMLElement;
          menu.focus();
          menu.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'D',
              bubbles: true,
              cancelable: true,
            })
          );
          await flushBrowserBenchUpdates();
        }
      );
    },
    navigationBenchOptions
  );
});
