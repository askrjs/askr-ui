import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { FocusScope } from '../../src/components/focus-scope';
describe('FocusScope benches', () => {
  bench(
    'SSR render default focus scope',
    () => {
      renderToStringSync(() => (
        <FocusScope
          {...{
            restoreFocus: true,
            children: [
              <button type="button">First</button>,
              <button type="button">Second</button>,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
  bench(
    'SSR render looping focus scope',
    () => {
      renderToStringSync(() => (
        <FocusScope
          {...{
            loop: true,
            children: [
              <button type="button">First</button>,
              <button type="button">Second</button>,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
  bench(
    'SSR render trapped focus scope',
    () => {
      renderToStringSync(() => (
        <FocusScope
          {...{
            trapped: true,
            children: [
              <button type="button">First</button>,
              <button type="button">Second</button>,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
