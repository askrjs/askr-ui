import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { DismissableLayer } from '../../../../src/components/dismissable-layer';
import { dismissableLayerEntryCountForTests } from '../../../../src/components/dismissable-layer/dismissable-layer';
import { mount, unmount } from '../../test-utils';

describe('DismissableLayer - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('should dismiss on Escape for the mounted layer', () => {
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

  it('should dismiss on document Escape for the top layer', () => {
    const onDismiss = vi.fn();

    container = mount(
      <DismissableLayer onDismiss={onDismiss}>
        <div>Layer</div>
      </DismissableLayer>
    );

    document.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })
    );

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should let an unconsumed Escape reach unrelated document handlers', () => {
    const globalEscape = vi.fn();
    const onDismiss = vi.fn();
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') globalEscape();
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    try {
      container = mount(
        <DismissableLayer
          onEscapeKeyDown={(event) => event.preventDefault()}
          onDismiss={onDismiss}
        >
          <button>Layer control</button>
        </DismissableLayer>
      );
      container.querySelector('button')?.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Escape',
        })
      );

      expect(onDismiss).not.toHaveBeenCalled();
      expect(globalEscape).toHaveBeenCalledOnce();
    } finally {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    }
  });

  it('should dismiss on outside pointer down', () => {
    const onDismiss = vi.fn();

    container = mount(
      <DismissableLayer onDismiss={onDismiss}>
        <div>Layer</div>
      </DismissableLayer>
    );

    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true })
    );

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should honor prevented outside pointer dismissals', () => {
    const onDismiss = vi.fn();

    container = mount(
      <DismissableLayer
        onPointerDownOutside={(event) => event.preventDefault()}
        onDismiss={onDismiss}
      >
        <div>Layer</div>
      </DismissableLayer>
    );

    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true })
    );

    expect(onDismiss).toHaveBeenCalledTimes(0);
  });

  it('should dismiss only the top layer when layers are stacked', () => {
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

    const layers = container.querySelectorAll(
      '[data-dismissable-layer="true"]'
    );
    const top = layers[1] as HTMLElement;

    top.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })
    );

    expect(innerDismiss).toHaveBeenCalledTimes(1);
    expect(outerDismiss).toHaveBeenCalledTimes(0);
  });

  it('should not dismiss when layer is disabled', () => {
    const onDismiss = vi.fn();

    container = mount(
      <DismissableLayer disabled onDismiss={onDismiss}>
        <div>Layer</div>
      </DismissableLayer>
    );

    const layer = container.querySelector(
      '[data-dismissable-layer="true"]'
    ) as HTMLElement;
    layer.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })
    );

    expect(onDismiss).toHaveBeenCalledTimes(0);
  });

  it('should delete per-ID registry entries after unmount', () => {
    const baseline = dismissableLayerEntryCountForTests();
    for (let index = 0; index < 25; index += 1) {
      container = mount(
        <DismissableLayer id={`transient-${index}`}>
          <div>Layer</div>
        </DismissableLayer>
      );
      unmount(container);
    }

    expect(dismissableLayerEntryCountForTests()).toBe(baseline);
  });

  it('should isolate layers with the same explicit ID across mount roots', () => {
    const firstDismiss = vi.fn();
    const secondDismiss = vi.fn();
    const firstContainer = mount(
      <DismissableLayer id="shared" onDismiss={firstDismiss}>
        <div>First</div>
      </DismissableLayer>
    );
    const secondContainer = mount(
      <DismissableLayer id="shared" onDismiss={secondDismiss}>
        <div>Second</div>
      </DismissableLayer>
    );

    try {
      unmount(secondContainer);
      document.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })
      );

      expect(firstDismiss).toHaveBeenCalledOnce();
      expect(secondDismiss).not.toHaveBeenCalled();
    } finally {
      unmount(firstContainer);
    }
  });
});
