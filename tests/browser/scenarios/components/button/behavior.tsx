import { state } from '@askrjs/askr';
import { Link } from '@askrjs/askr/router';
import { Button } from '../../../../../src/components/button';
import { flushUpdates, mount, spy } from '../../_mount';

export function nativeDefault(root: HTMLElement): void {
  mount(<Button>Save</Button>, root);
}

export function nativePress(root: HTMLElement) {
  const onPress = spy();
  mount(
    <Button onPress={onPress} data-testid="primary-action" aria-label="Save">
      Save
    </Button>,
    root
  );
  return { pressCount: () => onPress.count() };
}

export function disabledNative(root: HTMLElement) {
  const onPress = spy();
  mount(
    <Button disabled onPress={onPress}>
      Save
    </Button>,
    root
  );
  return { pressCount: () => onPress.count() };
}

export function asChildDisabledLink(root: HTMLElement) {
  const onPress = spy();
  const container = mount(
    <Button asChild disabled onPress={onPress} data-from-button="yes">
      <a href="/docs" data-from-child="yes">
        Docs
      </a>
    </Button>,
    root
  );

  return {
    /** Dispatches the synthetic Enter keydown and reports whether it was cancelled. */
    dispatchEnter: () => {
      const link = container.querySelector('a');
      const enter = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      link?.dispatchEvent(enter);
      return enter.defaultPrevented;
    },
    click: () => {
      container.querySelector('a')?.click();
    },
    pressCount: () => onPress.count(),
  };
}

export function asChildEnabledLink(root: HTMLElement) {
  const onPress = spy();
  const container = mount(
    <Button asChild onPress={onPress}>
      <a href="/docs">Docs</a>
    </Button>,
    root
  );
  const link = container.querySelector('a') as HTMLAnchorElement;

  return {
    dispatchEnter: () => {
      const enter = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      link.dispatchEvent(enter);
      return enter.defaultPrevented;
    },
    /** Clicks with navigation suppressed, exactly as the vitest original did. */
    clickWithoutNavigation: () => {
      link.addEventListener('click', (event) => event.preventDefault());
      link.click();
    },
    pressCount: () => onPress.count(),
  };
}

export function asChildAskrLink(root: HTMLElement) {
  const container = mount(
    <Button asChild>
      <Link href="/docs">Docs</Link>
    </Button>,
    root
  );
  const link = container.querySelector('a') as HTMLAnchorElement;

  return {
    dispatchEnter: () => {
      const enter = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      link.dispatchEvent(enter);
      return enter.defaultPrevented;
    },
  };
}

export function asChildNativeButton(root: HTMLElement) {
  const onPress = spy();
  const container = mount(
    <Button asChild onPress={onPress} disabled>
      <button type="button">Save</button>
    </Button>,
    root
  );

  return {
    click: () => {
      container.querySelector('button')?.click();
    },
    pressCount: () => onPress.count(),
  };
}

export function asChildSyntheticHost(root: HTMLElement) {
  const onPress = spy();
  const container = mount(
    <Button asChild onPress={onPress}>
      <span>Save</span>
    </Button>,
    root
  );

  return {
    dispatchEnter: () => {
      container
        .querySelector('span')
        ?.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
        );
    },
    pressCount: () => onPress.count(),
  };
}

export function asChildKeyboardActivation(root: HTMLElement) {
  const onPress = spy();
  const container = mount(
    <Button asChild onPress={onPress}>
      <span>Save</span>
    </Button>,
    root
  );
  const host = container.querySelector('[role="button"]') as HTMLElement;

  return {
    focusHost: () => {
      host.focus();
    },
    pressCount: () => onPress.count(),
  };
}

export function statefulIconChildren(root: HTMLElement) {
  const onPress = spy();

  const ThemeLikeButton = () => {
    const dark = state(false);

    return (
      <Button
        onPress={() => {
          onPress();
          dark.set(!dark());
        }}
        aria-label="Toggle icon"
      >
        {dark() ? (
          <svg aria-hidden="true" data-icon="moon" viewBox="0 0 16 16" />
        ) : (
          <svg aria-hidden="true" data-icon="sun" viewBox="0 0 16 16" />
        )}
      </Button>
    );
  };

  const container = mount(<ThemeLikeButton />, root);
  const initialButton = container.querySelector('button');

  const readIcons = () => {
    const button = container.querySelector('button');
    return {
      svgCount: button?.querySelectorAll('svg').length ?? 0,
      icon: button?.querySelector('svg')?.getAttribute('data-icon') ?? null,
    };
  };

  return {
    initial: () => readIcons(),
    clickAndRead: async () => {
      container.querySelector('button')?.click();
      await flushUpdates();
      const button = container.querySelector('button');
      return {
        pressCount: onPress.count(),
        sameButton: button === initialButton,
        ...readIcons(),
      };
    },
  };
}
