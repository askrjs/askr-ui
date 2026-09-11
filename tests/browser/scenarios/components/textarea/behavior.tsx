import { Textarea } from '../../../../../src/components/textarea/textarea';
import { mount } from '../../_mount';

export function nativeDefault(root: HTMLElement): void {
  mount(<Textarea rows={4}>Notes</Textarea>, root);
}

export function nativeDisabled(root: HTMLElement): void {
  mount(<Textarea disabled />, root);
}

export function nativeReadOnly(root: HTMLElement): void {
  mount(<Textarea readOnly>Locked notes</Textarea>, root);
}

export function asChildComposition(root: HTMLElement): void {
  mount(
    <Textarea asChild data-testid="custom-textarea" data-from-textarea="yes">
      <textarea aria-label="Notes" data-from-child="yes" />
    </Textarea>,
    root
  );
}

export function asChildDisabled(root: HTMLElement): void {
  mount(
    <Textarea asChild disabled>
      <textarea aria-label="Notes" />
    </Textarea>,
    root
  );
}

export function asChildReadOnly(root: HTMLElement): void {
  mount(
    <Textarea asChild readOnly>
      <textarea aria-label="Notes" />
    </Textarea>,
    root
  );
}

/** Captures the mount failure browser-side; the throw cannot cross to Node. */
export function asChildWithoutNativeHost(root: HTMLElement) {
  let message = '';

  try {
    mount(
      <Textarea asChild>
        <div role="textbox">Notes</div>
      </Textarea>,
      root
    );
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }

  return { error: () => message };
}
