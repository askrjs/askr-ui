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
      <textarea aria-label="Notes" aria-disabled={false} />
    </Textarea>,
    root
  );
}

export function asChildChildDisabled(root: HTMLElement): void {
  mount(
    <Textarea asChild>
      <textarea aria-label="Disabled notes" disabled />
    </Textarea>,
    root
  );
}

export function asChildChildTabIndex(root: HTMLElement): void {
  mount(
    <Textarea asChild>
      <textarea aria-label="Notes" tabIndex={-1} />
    </Textarea>,
    root
  );
}

export function asChildRefs(root: HTMLElement) {
  const childRef = { current: null as HTMLTextAreaElement | null };
  const componentRef = { current: null as Element | null };
  const container = mount(
    <Textarea asChild ref={componentRef}>
      <textarea ref={childRef} aria-label="Notes" />
    </Textarea>,
    root
  );

  return {
    bothRefsAreHost: () => {
      const host = container.querySelector('textarea');
      return childRef.current === host && componentRef.current === host;
    },
  };
}

export function nativeAriaDisabledOverride(root: HTMLElement): void {
  mount(
    <Textarea aria-label="Disabled notes" disabled aria-disabled={false} />,
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
