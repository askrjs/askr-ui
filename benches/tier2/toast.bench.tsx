import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import {
  Toast,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../src/components';
describe('Toast benches', () => {
  bench(
    'SSR render toast stack',
    () => {
      renderToStringSync(() => (
        <ToastHost
          {...{
            children: [
              <ToastViewport {...{}} />,
              <Toast
                {...{
                  defaultOpen: true,
                  children: [<ToastTitle {...{ children: 'Saved' }} />],
                }}
              />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
