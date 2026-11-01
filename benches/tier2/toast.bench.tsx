import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import {
  Toast,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../src/components';
describe('Toast benches', () => {
  registerBench(
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
