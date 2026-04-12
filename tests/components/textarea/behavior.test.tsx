import { afterEach, describe, expect, it } from 'vite-plus/test';
import { Textarea } from '../../../src/components/primitives/textarea/textarea';
import { mount, unmount } from '../../test-utils';

describe('Textarea - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('renders a native textarea by default', () => {
    container = mount(<Textarea rows={4}>Notes</Textarea>);

    const textarea = container.querySelector(
      'textarea'
    ) as HTMLTextAreaElement | null;

    expect(textarea?.getAttribute('rows')).toBe('4');
    expect(textarea?.textContent).toBe('Notes');
    expect(textarea?.getAttribute('data-slot')).toBe('textarea');
  });

  it('applies disabled semantics to native textarea', () => {
    container = mount(<Textarea disabled />);

    const textarea = container.querySelector(
      'textarea'
    ) as HTMLTextAreaElement | null;

    expect(textarea?.disabled).toBe(true);
    expect(textarea?.getAttribute('aria-disabled')).toBe('true');
    expect(textarea?.getAttribute('data-disabled')).toBe('true');
  });

  it('preserves readonly semantics on native textareas', () => {
    container = mount(<Textarea readOnly>Locked notes</Textarea>);

    const textarea = container.querySelector(
      'textarea'
    ) as HTMLTextAreaElement | null;

    expect(textarea?.readOnly).toBe(true);
    expect(textarea?.hasAttribute('readonly')).toBe(true);
  });

  it('supports asChild composition and merges host props', () => {
    container = mount(
      <Textarea asChild data-testid="custom-textarea" data-from-textarea="yes">
        <textarea aria-label="Notes" data-from-child="yes" />
      </Textarea>
    );

    const textarea = container.querySelector(
      'textarea'
    ) as HTMLTextAreaElement | null;

    expect(textarea?.getAttribute('data-testid')).toBe('custom-textarea');
    expect(textarea?.getAttribute('data-from-textarea')).toBe('yes');
    expect(textarea?.getAttribute('data-from-child')).toBe('yes');
    expect(textarea?.getAttribute('data-slot')).toBe('textarea');
  });

  it('applies native disabled semantics to asChild textarea hosts', () => {
    container = mount(
      <Textarea asChild disabled>
        <textarea aria-label="Notes" />
      </Textarea>
    );

    const host = container.querySelector(
      'textarea'
    ) as HTMLTextAreaElement | null;

    expect(host?.disabled).toBe(true);
    expect(host?.getAttribute('data-disabled')).toBe('true');
  });

  it('preserves readonly semantics on asChild textarea hosts', () => {
    container = mount(
      <Textarea asChild readOnly>
        <textarea aria-label="Notes" />
      </Textarea>
    );

    const host = container.querySelector(
      'textarea'
    ) as HTMLTextAreaElement | null;

    expect(host?.readOnly).toBe(true);
    expect(host?.hasAttribute('readonly')).toBe(true);
  });

  it('fails loudly when asChild does not receive a native textarea host', () => {
    expect(() =>
      mount(
        <Textarea asChild>
          <div role="textbox">Notes</div>
        </Textarea>
      )
    ).toThrow('Textarea `asChild` requires a native <textarea> host.');
  });
});
