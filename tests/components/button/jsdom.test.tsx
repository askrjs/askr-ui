import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { Button } from '../../../src/components/primitives/button';
import { Button as DistButton } from '../../../dist/components/primitives/button/button.js';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Button - jsdom regression', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  async function expectSingleIconAcrossToggles(
    Component: typeof Button,
    expectedFirstIcon = 'sun'
  ) {
    const onPress = vi.fn();

    const ThemeLikeButton = () => {
      const dark = state(false);

      return (
        <Component
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
        </Component>
      );
    };

    container = mount(<ThemeLikeButton />);

    let button = container.querySelector('button') as HTMLButtonElement | null;

    expect(button?.querySelectorAll('svg')).toHaveLength(1);
    expect(button?.querySelector('svg')?.getAttribute('data-icon')).toBe(
      expectedFirstIcon
    );

    button?.click();
    await flushUpdates();

    button = container.querySelector('button') as HTMLButtonElement | null;

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button?.querySelectorAll('svg')).toHaveLength(1);
    expect(button?.querySelector('svg')?.getAttribute('data-icon')).toBe(
      'moon'
    );

    button?.click();
    await flushUpdates();

    button = container.querySelector('button') as HTMLButtonElement | null;

    expect(onPress).toHaveBeenCalledTimes(2);
    expect(button?.querySelectorAll('svg')).toHaveLength(1);
    expect(button?.querySelector('svg')?.getAttribute('data-icon')).toBe('sun');
  }

  it('replaces a stateful icon child instead of accumulating icons in source', async () => {
    await expectSingleIconAcrossToggles(Button);
  });

  it('replaces a stateful icon child instead of accumulating icons in dist', async () => {
    await expectSingleIconAcrossToggles(DistButton);
  });
});
