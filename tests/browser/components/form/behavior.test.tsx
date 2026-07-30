import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { Form } from '../../../../src/components/form';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Form - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should renders a canonical form surface by default', async () => {
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

  it('should supports asChild composition for non-form hosts', async () => {
    container = mount(
      <Form asChild>
        <section>Fields</section>
      </Form>
    );

    await flushUpdates();

    const section = container.querySelector('section') as HTMLElement | null;

    expect(section?.getAttribute('data-slot')).toBe('form');
  });

  it('should submit and reset native controls given Form defaults when submit and reset events occur', async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const onReset = vi.fn();
    container = mount(
      <Form onSubmit={onSubmit} onReset={onReset}>
        <input name="name" defaultValue="Ada" />
        <button type="submit">Save</button>
        <button type="reset">Reset</button>
      </Form>
    );
    await flushUpdates();
    const form = container.querySelector('form') as HTMLFormElement;
    const input = container.querySelector('input') as HTMLInputElement;
    input.value = 'Grace';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('reset', { bubbles: true }));
    await flushUpdates();
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('should preserve form attributes given Form asChild when method, action, target, and encoding props are supplied', async () => {
    container = mount(
      <Form asChild method="post" action="/save" target="_blank" encType="multipart/form-data">
        <section>Fields</section>
      </Form>
    );
    await flushUpdates();
    const section = container.querySelector('section') as HTMLElement;
    expect(section.getAttribute('method')).toBe('post');
    expect(section.getAttribute('action')).toBe('/save');
    expect(section.getAttribute('target')).toBe('_blank');
    expect(section.getAttribute('enctype')).toBe('multipart/form-data');
  });
});
