import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { DismissableLayer } from '../../../src/components/composites/dismissable-layer';
import { mount, unmount } from '../../test-utils';

describe('DismissableLayer - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('dismisses on Escape for the mounted layer', () => {
    const onDismiss = vi.fn();

    container = mount(
      <DismissableLayer onDismiss={onDismiss}>
        <div>Layer</div>
      </DismissableLayer>
    );

    const layer = container.querySelector('[data-dismissable-layer="true"]')!;
    layer.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })
    );

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismisses only the top layer when layers are stacked', () => {
    const outerDismiss = vi.fn();
    const innerDismiss = vi.fn();

    container = mount(
      <DismissableLayer onDismiss={outerDismiss}>
        <div>
          <DismissableLayer onDismiss={innerDismiss}>
            <div>Inner</div>
          </DismissableLayer>
        </div>
      </DismissableLayer>
    );

    const layers = container.querySelectorAll('[data-dismissable-layer="true"]');
    const top = layers[1] as HTMLElement;

    top.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })
    );

    expect(innerDismiss).toHaveBeenCalledTimes(1);
    expect(outerDismiss).toHaveBeenCalledTimes(0);
  });

  it('does not dismiss when layer is disabled', () => {
    const onDismiss = vi.fn();

    container = mount(
      <DismissableLayer disabled onDismiss={onDismiss}>
        <div>Layer</div>
      </DismissableLayer>
    );

    const layer = container.querySelector('[data-dismissable-layer="true"]') as HTMLElement;
    layer.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })
    );

    expect(onDismiss).toHaveBeenCalledTimes(0);
  });
});
