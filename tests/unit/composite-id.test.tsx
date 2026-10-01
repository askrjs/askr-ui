import { describe, expect, it, vi } from 'vite-plus/test';
import { createRequire } from 'node:module';
import { renderToStringSync } from '@askrjs/askr/ssr';
import { ErrorBoundary } from '@askrjs/askr/components';
import { RadioGroup, RadioGroupItem } from '../../src/components/radio-group';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogTrigger,
} from '../../src/components/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '../../src/components/alert-dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../src/components/hover-card';
import { createSsrIdRegistration } from '../../src/components/_internal/ssr-id-association';

function IdenticalServerComposites() {
  return (
    <div>
      <RadioGroup defaultValue="same">
        <RadioGroupItem value="same">Same</RadioGroupItem>
      </RadioGroup>
      <RadioGroup defaultValue="same">
        <RadioGroupItem value="same">Same</RadioGroupItem>
      </RadioGroup>
    </div>
  );
}

describe('Composite generated identity', () => {
  it.each([false, true])(
    'should associate a later opaque sibling title, portaled=%s',
    (portaled) => {
      const LaterTitle = () => (
        <DialogTitle id="later-title">Later title</DialogTitle>
      );
      const Body = () => <DialogContent>Body</DialogContent>;
      const html = renderToStringSync(() => (
        <Dialog defaultOpen>
          {portaled ? (
            <DialogPortal>
              <Body />
            </DialogPortal>
          ) : (
            <Body />
          )}
          <LaterTitle />
        </Dialog>
      ));
      expect(html).toContain('id="later-title"');
      expect(html).toContain('aria-labelledby="later-title"');
    }
  );

  it('should drop label registrations with a caught failed subtree', () => {
    const Fail = () => {
      throw new Error('discard the label subtree');
    };
    const warning = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const html = renderToStringSync(() => (
        <Dialog defaultOpen>
          <DialogContent>
            <ErrorBoundary fallback={<p>Recovered body</p>}>
              <DialogTitle id="discarded-label">Discarded</DialogTitle>
              <Fail />
            </ErrorBoundary>
          </DialogContent>
        </Dialog>
      ));
      expect(html).toContain('Recovered body');
      expect(html).not.toContain('id="discarded-label"');
      expect(html).not.toContain('aria-labelledby="discarded-label"');
    } finally {
      warning.mockRestore();
    }
  });

  it('should associate an earlier trigger with the custom later content id', () => {
    const html = renderToStringSync(() => (
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent id="late-content">Body</DialogContent>
      </Dialog>
    ));
    expect(html).toContain('id="late-content"');
    expect(html).toContain('aria-controls="late-content"');
  });

  it('should keep one ID cleanup listener per part lifetime', () => {
    const registration = createSsrIdRegistration('fallback');
    const first = new AbortController();
    const second = new AbortController();
    const listeners = vi.spyOn(AbortSignal.prototype, 'addEventListener');
    try {
      for (let index = 0; index < 25; index++) {
        registration.register(`first-${index}`, first.signal);
      }
      registration.register('second', second.signal);
      expect(
        listeners.mock.calls.filter(
          ([, listener]) =>
            typeof listener === 'function' &&
            listener.name === 'removeRenderedId'
        )
      ).toHaveLength(2);
      expect(registration.cell.value).toBe('second');
      second.abort();
      expect(registration.cell.value).toBe('first-24');
      first.abort();
      expect(registration.cell.value).toBe('fallback');
    } finally {
      listeners.mockRestore();
    }
  });

  for (const family of ['dialog', 'alert-dialog']) {
    it.each([false, true])(
      `should associate ${family} server content with rendered titles and descriptions, wrapped=%s`,
      (wrapped) => {
        const Root = family === 'dialog' ? Dialog : AlertDialog;
        const Content =
          family === 'dialog' ? DialogContent : AlertDialogContent;
        const Title = family === 'dialog' ? DialogTitle : AlertDialogTitle;
        const Description =
          family === 'dialog' ? DialogDescription : AlertDialogDescription;
        const Parts = () => (
          <>
            <Title>Title</Title>
            <Description>Description</Description>
          </>
        );
        const html = renderToStringSync(() => (
          <Root defaultOpen>
            <Content>
              {wrapped ? (
                <Parts />
              ) : (
                <>
                  <Title>Title</Title>
                  <Description>Description</Description>
                </>
              )}
            </Content>
          </Root>
        ));
        const title = html.match(/<h2[^>]*\bid="([^"]+)"/)?.[1];
        const description = html.match(/<p[^>]*\bid="([^"]+)"/)?.[1];
        const content = html.match(
          /<[^>]*\bdata-slot="dialog-content"[^>]*>/
        )?.[0];
        expect(title).toBeDefined();
        expect(description).toBeDefined();
        expect(content).toContain(`aria-labelledby="${title}"`);
        expect(content).toContain(`aria-describedby="${description}"`);
      }
    );
  }

  it('should associate custom server title and description ids', () => {
    const html = renderToStringSync(() => (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle id="custom-title">Title</DialogTitle>
          <DialogDescription id="custom-description">
            Description
          </DialogDescription>
        </DialogContent>
      </Dialog>
    ));
    expect(html).toContain('aria-labelledby="custom-title"');
    expect(html).toContain('aria-describedby="custom-description"');
  });

  it('should resolve reactive part ids once and evaluate wrapped server parts once', () => {
    let titleReads = 0;
    let descriptionReads = 0;
    let renders = 0;
    function Parts() {
      renders++;
      return (
        <>
          <DialogTitle
            id={() => {
              titleReads++;
              return 'reactive-title';
            }}
          >
            Title
          </DialogTitle>
          <DialogDescription
            id={() => {
              descriptionReads++;
              return 'reactive-description';
            }}
          >
            Description
          </DialogDescription>
        </>
      );
    }
    const html = renderToStringSync(() => (
      <Dialog defaultOpen>
        <DialogContent>
          <Parts />
        </DialogContent>
      </Dialog>
    ));
    expect(html).toContain('aria-labelledby="reactive-title"');
    expect(html).toContain('aria-describedby="reactive-description"');
    expect({ titleReads, descriptionReads, renders }).toEqual({
      titleReads: 1,
      descriptionReads: 1,
      renders: 1,
    });
  });

  it('should preserve caller server content aria associations', () => {
    const html = renderToStringSync(() => (
      <Dialog defaultOpen>
        <DialogContent
          aria-labelledby="caller-title"
          aria-describedby="caller-description"
        >
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    ));
    expect(html).toContain('aria-labelledby="caller-title"');
    expect(html).toContain('aria-describedby="caller-description"');
  });

  it('should omit server associations when optional wrapped parts render nothing', () => {
    const EmptyParts = () => null;
    const html = renderToStringSync(() => (
      <Dialog defaultOpen>
        <DialogContent>
          <EmptyParts />
          Body
        </DialogContent>
      </Dialog>
    ));
    expect(html).not.toContain('aria-labelledby');
    expect(html).not.toContain('aria-describedby');
  });

  it('should keep nested server dialog label registrations in their owning roots', () => {
    const html = renderToStringSync(() => (
      <Dialog id="outer" defaultOpen>
        <DialogContent>
          <DialogTitle id="outer-title">Outer</DialogTitle>
          <Dialog id="inner" defaultOpen>
            <DialogContent>
              <DialogTitle id="inner-title">Inner</DialogTitle>
              <DialogDescription id="inner-description">
                Inner description
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    ));
    const outer = html.match(/<div[^>]*id="dialog-outer-content"[^>]*>/)?.[0];
    const inner = html.match(/<div[^>]*id="dialog-inner-content"[^>]*>/)?.[0];
    expect(outer).toContain('aria-labelledby="outer-title"');
    expect(outer).not.toContain('aria-describedby');
    expect(inner).toContain('aria-labelledby="inner-title"');
    expect(inner).toContain('aria-describedby="inner-description"');
  });

  it('should preserve wrapped label associations through a server dialog portal', () => {
    const Parts = () => (
      <>
        <DialogTitle id="portaled-title">Title</DialogTitle>
        <DialogDescription id="portaled-description">
          Description
        </DialogDescription>
      </>
    );
    const html = renderToStringSync(() => (
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogContent>
            <Parts />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));
    expect(html).toContain('aria-labelledby="portaled-title"');
    expect(html).toContain('aria-describedby="portaled-description"');
  });

  it('should associate rendered server labels when a document global exists', () => {
    const { JSDOM } = createRequire(import.meta.url)('jsdom') as {
      JSDOM: new (html: string) => {
        window: {
          document: Document;
          HTMLElement: typeof HTMLElement;
          close: () => void;
        };
      };
    };
    const dom = new JSDOM(
      '<!doctype html><html><head></head><body></body></html>'
    );
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const elementDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'HTMLElement'
    );
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: dom.window.document,
    });
    Object.defineProperty(globalThis, 'HTMLElement', {
      configurable: true,
      value: dom.window.HTMLElement,
    });
    try {
      const html = renderToStringSync(() => (
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle id="document-title">Title</DialogTitle>
          </DialogContent>
        </Dialog>
      ));
      expect(html).toContain('aria-labelledby="document-title"');
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
      else Reflect.deleteProperty(globalThis, 'document');
      if (elementDescriptor)
        Object.defineProperty(globalThis, 'HTMLElement', elementDescriptor);
      else Reflect.deleteProperty(globalThis, 'HTMLElement');
      dom.window.close();
    }
  });

  it('should discard server label registrations after an error and recover on a later render', () => {
    const FailingParts = () => {
      throw new Error('label render failed');
    };
    expect(() =>
      renderToStringSync(() => (
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle id="discarded-title">Discarded</DialogTitle>
            <FailingParts />
          </DialogContent>
        </Dialog>
      ))
    ).toThrow('label render failed');
    const empty = renderToStringSync(() => (
      <Dialog defaultOpen>
        <DialogContent>Body</DialogContent>
      </Dialog>
    ));
    expect(empty).not.toContain('aria-labelledby');
    const recovered = renderToStringSync(() => (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle id="recovered-title">Recovered</DialogTitle>
        </DialogContent>
      </Dialog>
    ));
    expect(recovered).toContain('aria-labelledby="recovered-title"');
  });

  it('should render a hover card on the server without browser globals', () => {
    const html = renderToStringSync(() => (
      <HoverCard>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    ));

    expect(html).toContain('Preview');
    expect(html).toContain('data-slot="hover-card-trigger"');
  });

  it('should render identical SSR siblings with unique and repeatable ids', () => {
    const first = renderToStringSync(IdenticalServerComposites);
    const second = renderToStringSync(IdenticalServerComposites);
    const ids = Array.from(
      first.matchAll(/\sid="([^"]+)"/g),
      (match) => match[1]
    );

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(second).toBe(first);
  });
});
