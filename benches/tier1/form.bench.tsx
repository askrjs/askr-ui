import { bench, describe } from 'vite-plus/test';
import { Form } from '../../src/components/form';

describe('Form benches', () => {
  bench('create native form', () => {
    Form({
      method: 'post',
      children: <button type="submit">Save</button>,
    });
  });

  bench('create form with asChild host', () => {
    Form({
      asChild: true,
      children: <section>Fields</section>,
    });
  });
});
