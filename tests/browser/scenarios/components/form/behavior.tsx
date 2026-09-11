import { Form } from '../../../../../src/components/form';
import { flushUpdates, mount, spy } from '../../_mount';

export function canonicalSurface(root: HTMLElement): void {
  mount(
    <Form method="post">
      <button type="submit">Save</button>
    </Form>,
    root
  );
}

export function asChildComposition(root: HTMLElement): void {
  mount(
    <Form asChild>
      <section>Fields</section>
    </Form>,
    root
  );
}

export function submitAndReset(root: HTMLElement) {
  const onSubmit = spy<[Event]>((event) => event.preventDefault());
  const onReset = spy<[Event]>();
  const container = mount(
    <Form onSubmit={onSubmit} onReset={onReset}>
      <input name="name" defaultValue="Ada" />
      <button type="submit">Save</button>
      <button type="reset">Reset</button>
    </Form>,
    root
  );

  return {
    /** Mirrors the original test body: edit, then dispatch submit and reset. */
    dispatch: async () => {
      await flushUpdates();
      const form = container.querySelector('form') as HTMLFormElement;
      const input = container.querySelector('input') as HTMLInputElement;
      input.value = 'Grace';
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
      form.dispatchEvent(new Event('reset', { bubbles: true }));
      await flushUpdates();
    },
    counts: () => ({ submit: onSubmit.count(), reset: onReset.count() }),
  };
}

export function asChildFormAttributes(root: HTMLElement): void {
  mount(
    <Form
      asChild
      method="post"
      action="/save"
      target="_blank"
      encType="multipart/form-data"
    >
      <section>Fields</section>
    </Form>,
    root
  );
}
