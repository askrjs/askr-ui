import { state } from '@askrjs/askr';
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '../../../../../src/components/slider';
import { flushUpdates, mount, spy, unmount } from '../../_mount';

/**
 * The slider is headless, so without layout its track and thumb have no box a
 * real pointer can hit. These rules give the track a fixed 200px width and
 * place the thumb from `--ak-slider-percentage`, so a spec can press and drag
 * with Playwright's mouse at known coordinates.
 */
const LAYOUT_CSS = `
  #mount-root [data-slider-track] {
    position: relative;
    box-sizing: border-box;
    width: 200px;
    height: 20px;
    margin: 40px;
  }
  #mount-root [data-slider-thumb] {
    position: absolute;
    top: 0;
    width: 10px;
    height: 20px;
    inset-inline-start: calc(var(--ak-slider-percentage) - 5px);
  }
`;

function withLayout(root: HTMLElement): void {
  const style = document.createElement('style');
  style.textContent = LAYOUT_CSS;
  root.append(style);
}

export function pointerAndKeyboard(root: HTMLElement): void {
  withLayout(root);
  mount(
    <Slider defaultValue={20} name="volume">
      <SliderTrack>
        <SliderRange />
        <SliderThumb aria-label="Volume" />
      </SliderTrack>
    </Slider>,
    root
  );
}

export function callerTrackRef(root: HTMLElement) {
  withLayout(root);
  let received: Element | null = null;
  mount(
    <Slider defaultValue={20} name="volume">
      <SliderTrack
        ref={(node: HTMLDivElement | null) => {
          if (node) received = node;
        }}
      >
        <SliderRange />
        <SliderThumb aria-label="Volume" />
      </SliderTrack>
    </Slider>,
    root
  );

  return {
    /** Whether the caller's ref received the rendered track element. */
    refIsTrack: () =>
      received instanceof HTMLElement &&
      received.getAttribute('data-slot') === 'slider-track',
  };
}

export function asChildTrack(root: HTMLElement): void {
  withLayout(root);
  mount(
    <Slider defaultValue={20} name="volume">
      <SliderTrack asChild>
        <section>
          <SliderRange />
          <SliderThumb aria-label="Volume" />
        </section>
      </SliderTrack>
    </Slider>,
    root
  );
}

export function rtl(root: HTMLElement): void {
  withLayout(root);
  mount(
    <div dir="rtl">
      <Slider defaultValue={50} name="volume">
        <SliderTrack>
          <SliderRange />
          <SliderThumb aria-label="Volume" />
        </SliderTrack>
      </Slider>
    </div>,
    root
  );
}

export function formReset(root: HTMLElement) {
  const onValueChange = spy<[number]>();
  const container = mount(
    <form>
      <Slider defaultValue={20} name="volume" onValueChange={onValueChange}>
        <SliderTrack>
          <SliderRange />
          <SliderThumb aria-label="Volume" />
        </SliderTrack>
      </Slider>
    </form>,
    root
  );

  return {
    reset: async () => {
      (container.querySelector('form') as HTMLFormElement).reset();
      await flushUpdates();
    },
    calls: () => onValueChange.calls,
  };
}

export function percentageVariable(root: HTMLElement): void {
  mount(
    <Slider defaultValue={25} min={0} max={100}>
      <SliderTrack>
        <SliderRange />
        <SliderThumb aria-label="Volume" />
      </SliderTrack>
    </Slider>,
    root
  );
}

export function unmountMidDrag(root: HTMLElement) {
  withLayout(root);
  const container = mount(
    <Slider defaultValue={20}>
      <SliderTrack>
        <SliderRange />
        <SliderThumb aria-label="Volume" />
      </SliderTrack>
    </Slider>,
    root
  );

  return {
    /** Unmounts while a drag is active and reports the listeners removed. */
    unmountAndCollectRemovedListeners: () => {
      const removed: string[] = [];
      const original = window.removeEventListener;
      window.removeEventListener = function (
        this: Window,
        ...args: Parameters<Window['removeEventListener']>
      ) {
        removed.push(args[0]);
        return original.apply(this, args);
      } as Window['removeEventListener'];
      try {
        unmount(container);
      } finally {
        window.removeEventListener = original;
      }
      return removed;
    },
  };
}

export function keyboardBoundaries(root: HTMLElement): void {
  mount(
    <Slider defaultValue={50} min={0} max={100} step={5} name="volume">
      <SliderTrack>
        <SliderRange />
        <SliderThumb aria-label="Volume" />
      </SliderTrack>
    </Slider>,
    root
  );
}

export function disabled(root: HTMLElement): void {
  withLayout(root);
  mount(
    <Slider disabled defaultValue={30} name="volume">
      <SliderTrack>
        <SliderRange />
        <SliderThumb aria-label="Volume" />
      </SliderTrack>
    </Slider>,
    root
  );
}

export function dragLifecycle(root: HTMLElement) {
  withLayout(root);
  const changes: number[] = [];
  let disabled!: ReturnType<typeof state<boolean>>;
  function Demo() {
    disabled = state(false);
    return (
      <Slider
        defaultValue={20}
        disabled={disabled()}
        onValueChange={(value) => changes.push(value)}
      >
        <SliderTrack>
          <SliderRange />
          <SliderThumb aria-label="Volume" />
        </SliderTrack>
      </Slider>
    );
  }
  mount(<Demo />, root);
  return {
    disable: async () => {
      disabled.set(true);
      await flushUpdates();
    },
    changes: () => changes,
  };
}

export function asChildPartRefs(root: HTMLElement) {
  const refs: Record<string, Element | null> = {};
  const saveRef = (name: string) => (node: Element | null) => {
    refs[name] = node;
  };
  mount(
    <Slider defaultValue={50}>
      <SliderTrack asChild ref={saveRef('track-component')}>
        <section ref={saveRef('track-child')}>
          <SliderRange asChild ref={saveRef('range-component')}>
            <i ref={saveRef('range-child')} />
          </SliderRange>
          <SliderThumb asChild ref={saveRef('thumb-component')}>
            <button aria-label="Volume" ref={saveRef('thumb-child')} />
          </SliderThumb>
        </section>
      </SliderTrack>
    </Slider>,
    root
  );

  return {
    refStatus: () =>
      Object.fromEntries(
        Object.entries(refs).map(([name, node]) => [name, node !== null])
      ),
  };
}

export function semanticOverrides(root: HTMLElement): void {
  mount(
    <Slider defaultValue={50} min={0} max={100} orientation="vertical">
      <SliderTrack>
        <SliderRange />
        <SliderThumb
          aria-label="Volume"
          role="button"
          aria-valuemin="10"
          aria-valuemax="20"
          aria-valuenow="15"
          aria-orientation="horizontal"
        />
      </SliderTrack>
    </Slider>,
    root
  );
}

export function disabledAsChildThumb(root: HTMLElement): void {
  mount(
    <Slider disabled defaultValue={30}>
      <SliderTrack>
        <SliderRange />
        <SliderThumb asChild>
          <button aria-label="Volume" />
        </SliderThumb>
      </SliderTrack>
    </Slider>,
    root
  );
}

export async function iframeDrag(root: HTMLElement): Promise<void> {
  const iframe = document.createElement('iframe');
  iframe.style.width = '320px';
  iframe.style.height = '180px';
  root.appendChild(iframe);
  const ownerDocument = iframe.contentDocument;
  if (!ownerDocument) throw new Error('Expected a same-origin iframe document');
  const appRoot = ownerDocument.createElement('div');
  appRoot.id = 'mount-root';
  ownerDocument.body.append(appRoot);
  const style = ownerDocument.createElement('style');
  style.textContent = LAYOUT_CSS;
  ownerDocument.head.append(style);
  mount(
    <Slider defaultValue={20} name="volume">
      <SliderTrack>
        <SliderRange />
        <SliderThumb aria-label="Volume" />
      </SliderTrack>
    </Slider>,
    appRoot
  );
  await flushUpdates();
}
