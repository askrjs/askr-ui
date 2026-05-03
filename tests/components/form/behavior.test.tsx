import { afterEach, describe, expect, it } from 'vite-plus/test';
import { Form } from '../../../src/components/primitives/form';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Form - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('renders a canonical form surface by default', async () => {
    container = mount(
      <Form method="post">
        <button type="submit">Save</button>
      </Form>
    );

    await flushUpdates();

    const form = container.querySelector('form') as HTMLFormElement | null;

    expect(form?.getAttribute('data-slot')).toBe('form');
    expect(form?.getAttribute('method')).toBe('post');
  });

  it('supports asChild composition for non-form hosts', async () => {
    container = mount(
      <Form asChild>
        <section>Fields</section>
      </Form>
    );

    await flushUpdates();

    const section = container.querySelector('section') as HTMLElement | null;

    expect(section?.getAttribute('data-slot')).toBe('form');
  });
});
