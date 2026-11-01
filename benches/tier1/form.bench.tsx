import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import { Form } from '../../src/components/form';
describe('Form benches', () => {
  registerBench(
    'SSR render native form',
    () => {
      renderToStringSync(() => (
        <Form
          {...{
            method: 'post',
            children: <button type="submit">Save</button>,
          }}
        />
      ));
    },
    { throws: true }
  );
  registerBench(
    'SSR render form with asChild host',
    () => {
      renderToStringSync(() => (
        <Form
          {...{
            asChild: true,
            children: <section>Fields</section>,
          }}
        />
      ));
    },
    { throws: true }
  );
});
