import { DismissableLayer } from '../../../../../src/components/dismissable-layer';
import { dismissableLayerEntryCountForTests } from '../../../../../src/components/dismissable-layer/dismissable-layer';
import { mount, spy, unmount } from '../../_mount';

/**
 * A plain element beside the layer for real outside presses. Firefox fires no
 * pointer events for a press below the document's content box, so a press on
 * empty viewport space is not a dependable "outside" target.
 */
function mountOutsideTarget(root: HTMLElement): void {
  const outside = document.createElement('div');
  outside.setAttribute('data-testid', 'outside');
  outside.textContent = 'Outside';
  outside.style.height = '120px';
  root.append(outside);
}

export function singleLayer(root: HTMLElement) {
  const onDismiss = spy();
  mountOutsideTarget(root);
  mount(
    <DismissableLayer onDismiss={onDismiss}>
      <div>Layer</div>
    </DismissableLayer>,
    root
  );

  return { dismissCount: () => onDismiss.count() };
}

export function preventedEscape(root: HTMLElement) {
  const onDismiss = spy();
  const globalEscape = spy();
  const handleGlobalKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') globalEscape();
  };
  // Each Playwright test gets a fresh page, so this document listener cannot
  // leak into another test.
  document.addEventListener('keydown', handleGlobalKeyDown);
  mount(
    <DismissableLayer
      onEscapeKeyDown={(event) => event.preventDefault()}
      onDismiss={onDismiss}
    >
      <button>Layer control</button>
    </DismissableLayer>,
    root
  );
  return {
    dismissCount: () => onDismiss.count(),
    globalEscapeCount: () => globalEscape.count(),
  };
}

export function preventedPointerOutside(root: HTMLElement) {
  const onDismiss = spy();
  mountOutsideTarget(root);
  mount(
    <DismissableLayer
      onPointerDownOutside={(event) => event.preventDefault()}
      onDismiss={onDismiss}
    >
      <div>Layer</div>
    </DismissableLayer>,
    root
  );

  return { dismissCount: () => onDismiss.count() };
}

export function stackedLayers(root: HTMLElement) {
  const outerDismiss = spy();
  const innerDismiss = spy();
  mount(
    <DismissableLayer onDismiss={outerDismiss}>
      <div>
        <DismissableLayer onDismiss={innerDismiss}>
          <div>Inner</div>
        </DismissableLayer>
      </div>
    </DismissableLayer>,
    root
  );

  return {
    counts: () => ({
      inner: innerDismiss.count(),
      outer: outerDismiss.count(),
    }),
  };
}

export function disabledLayer(root: HTMLElement) {
  const onDismiss = spy();
  mount(
    <DismissableLayer disabled onDismiss={onDismiss}>
      <div>Layer</div>
    </DismissableLayer>,
    root
  );

  return { dismissCount: () => onDismiss.count() };
}

export function registryChurn(root: HTMLElement) {
  return {
    /** Mounts and unmounts 25 layers with distinct IDs; returns entry counts. */
    churn: () => {
      const baseline = dismissableLayerEntryCountForTests();
      for (let index = 0; index < 25; index += 1) {
        const container = mount(
          <DismissableLayer id={`transient-${index}`}>
            <div>Layer</div>
          </DismissableLayer>,
          root
        );
        unmount(container);
      }
      return { baseline, after: dismissableLayerEntryCountForTests() };
    },
  };
}

export function sharedIdAcrossRoots(root: HTMLElement) {
  const firstDismiss = spy();
  const secondDismiss = spy();
  mount(
    <DismissableLayer id="shared" onDismiss={firstDismiss}>
      <div>First</div>
    </DismissableLayer>,
    root
  );
  const secondContainer = mount(
    <DismissableLayer id="shared" onDismiss={secondDismiss}>
      <div>Second</div>
    </DismissableLayer>,
    root
  );

  return {
    unmountSecond: () => unmount(secondContainer),
    counts: () => ({
      first: firstDismiss.count(),
      second: secondDismiss.count(),
    }),
  };
}
