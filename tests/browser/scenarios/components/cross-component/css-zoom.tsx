import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTrigger,
} from '../../../../../src/components/dialog';
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../../../../src/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '../../../../../src/components/select';
import { mount } from '../../_mount';

type Options = {
  html?: number;
  body?: number;
  trigger?: number;
  content?: number;
  fallback?: boolean;
  oversized?: boolean;
};

function prepare(root: HTMLElement, options: Options) {
  document.documentElement.style.zoom = String(options.html ?? 1);
  document.body.style.zoom = String(options.body ?? 1);
  const style = document.createElement('style');
  style.textContent = `
    [data-zoom-trigger] {
      position: fixed;
      left: 40px;
      top: 80px;
      box-sizing: border-box;
      width: 40px;
      height: 20px;
      margin: 0;
      padding: 0;
      border: 0;
      zoom: ${options.trigger ?? 1};
    }
    [data-zoom-content] {
      box-sizing: border-box;
      width: ${options.oversized ? 400 : 100}px;
      height: ${options.oversized ? 400 : 60}px;
      max-width: var(--ak-overlay-available-width);
      max-height: var(--ak-overlay-available-height);
      overflow: auto;
      zoom: ${options.content ?? 1};
    }
    [data-slot="select-content"][data-zoom-content] { width: 1px; }
  `;
  root.append(style);
  return (node: HTMLElement | null) => {
    // Exercise engines without the new CSSOM accessor using the same real
    // browser layout. This affects only this fixture's content element.
    if (node && options.fallback) {
      Object.defineProperty(node, 'currentCSSZoom', {
        value: undefined,
        configurable: true,
      });
    }
  };
}

export function anchored(root: HTMLElement, options: Options) {
  const ref = prepare(root, options);
  mount(
    <Popover>
      <PopoverTrigger data-zoom-trigger>Inspect</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          data-zoom-content
          ref={ref}
          side="right"
          align="start"
          sideOffset={8}
          aria-label="Zoom details"
        >
          <button>Details action</button>
        </PopoverContent>
      </PopoverPortal>
    </Popover>,
    root
  );
}

export function centered(root: HTMLElement, options: Options) {
  const ref = prepare(root, options);
  mount(
    <Dialog>
      <DialogTrigger data-zoom-trigger>Preferences</DialogTrigger>
      <DialogPortal>
        <DialogContent
          data-zoom-content
          ref={ref}
          aria-label="Zoom preferences"
        >
          <button>Preferences action</button>
        </DialogContent>
      </DialogPortal>
    </Dialog>,
    root
  );
}

export function matchedWidth(root: HTMLElement, options: Options) {
  const ref = prepare(root, options);
  mount(
    <Select defaultValue="one">
      <SelectTrigger data-zoom-trigger aria-label="Zoom choice">
        {'One'}
      </SelectTrigger>
      <SelectPortal>
        <SelectContent data-zoom-content ref={ref}>
          <SelectItem value="one">One</SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );
}
