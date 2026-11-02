import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import { FocusScope } from '../../src/components/focus-scope';
describe('FocusScope benches', () => {
  registerBench(
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
  registerBench(
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
  registerBench(
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
