import { describe, expect, it } from 'vite-plus/test';
import { renderToStringSync } from '@askrjs/askr/ssr';
import { For } from '@askrjs/askr/control';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectPortal,
} from '../../src/components/select';

function WrappedLabel() {
  return <SelectLabel>Frameworks</SelectLabel>;
}
function groupTag(html: string) {
  return (
    html.match(
      /<(?:div|section)\b(?=[^>]*data-slot="select-group")[^>]*>/
    )?.[0] ?? ''
  );
}
function LabelledSelect(props: { wrapped?: boolean; unlabelled?: boolean }) {
  return (
    <Select defaultOpen>
      <SelectPortal>
        <SelectContent>
          <SelectGroup>
            {props.unlabelled ? null : props.wrapped ? (
              <WrappedLabel />
            ) : (
              <SelectLabel>Frameworks</SelectLabel>
            )}
            <SelectItem value="askr">Askr</SelectItem>
          </SelectGroup>
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}

describe('Select SSR label linking', () => {
  it('should preserve explicit null caller group labeling in server markup', () => {
    const html = renderToStringSync(() => (
      <Select>
        <SelectGroup aria-labelledby={null}>
          <WrappedLabel />
        </SelectGroup>
      </Select>
    ));
    expect(groupTag(html)).not.toContain('aria-labelledby');
  });

  for (const entry of [
    { name: 'null', id: null },
    { name: 'empty string', id: '' },
    { name: 'reactive undefined', id: () => undefined },
    { name: 'reactive null', id: () => null },
  ]) {
    it(`should preserve ${entry.name} native label ID omission semantics in server markup`, () => {
      const html = renderToStringSync(() => (
        <Select>
          <SelectGroup>
            <SelectLabel id={entry.id}>Frameworks</SelectLabel>
          </SelectGroup>
        </Select>
      ));
      const tag =
        html.match(/<div\b(?=[^>]*data-slot="select-label")[^>]*>/)?.[0] ?? '';
      if (entry.name === 'empty string') expect(tag).toContain('id=""');
      else expect(tag).not.toMatch(/\bid=/);
      expect(groupTag(html)).not.toContain('aria-labelledby');
    });
  }

  it('should resolve a reactive caller label id once while linking server markup', () => {
    let reads = 0;
    const html = renderToStringSync(() => (
      <Select>
        <SelectGroup>
          <SelectLabel
            id={() => {
              reads += 1;
              return 'reactive-frameworks';
            }}
          >
            Frameworks
          </SelectLabel>
        </SelectGroup>
      </Select>
    ));
    expect(groupTag(html)).toContain('aria-labelledby="reactive-frameworks"');
    expect(html).toContain('id="reactive-frameworks"');
    expect(reads).toBe(1);
  });

  for (const wrapped of [false, true]) {
    it(`should associate the actual caller label id in ${wrapped ? 'wrapped' : 'literal'} server markup`, () => {
      function CallerLabel() {
        return <SelectLabel id="caller-frameworks">Frameworks</SelectLabel>;
      }
      const html = renderToStringSync(() => (
        <Select>
          <SelectGroup>
            {wrapped ? (
              <CallerLabel />
            ) : (
              <SelectLabel id="caller-frameworks">Frameworks</SelectLabel>
            )}
          </SelectGroup>
        </Select>
      ));
      expect(html).toContain('id="caller-frameworks"');
      expect(groupTag(html)).toContain('aria-labelledby="caller-frameworks"');
    });
  }

  it('should associate an asChild wrapped group label without evaluating it twice', () => {
    let calls = 0;
    function CountedLabel() {
      calls += 1;
      return <SelectLabel>Frameworks</SelectLabel>;
    }
    const html = renderToStringSync(() => (
      <Select>
        <SelectGroup asChild>
          <section>
            <CountedLabel />
          </section>
        </SelectGroup>
      </Select>
    ));
    expect(groupTag(html)).toMatch(/aria-labelledby="[^"]+-label"/);
    expect(html).not.toContain('children-before-attrs');
    expect(calls).toBe(1);
  });

  it('should associate a For-rendered group label', () => {
    const html = renderToStringSync(() => (
      <Select>
        <SelectGroup>
          <For each={['Frameworks']} by={(text) => text}>
            {(text) => <SelectLabel>{text}</SelectLabel>}
          </For>
        </SelectGroup>
      </Select>
    ));
    expect(groupTag(html)).toMatch(/aria-labelledby="[^"]+-label"/);
  });

  it('should not claim a literal label owned by a nested group', () => {
    const html = renderToStringSync(() => (
      <Select>
        <SelectGroup>
          <SelectGroup>
            <SelectLabel>Inner</SelectLabel>
          </SelectGroup>
        </SelectGroup>
      </Select>
    ));
    const tags = [
      ...html.matchAll(/<div\b(?=[^>]*data-slot="select-group")[^>]*>/g),
    ].map((match) => match[0]);
    expect(tags).toHaveLength(2);
    expect(tags[0]).not.toContain('aria-labelledby');
    expect(tags[1]).toMatch(/aria-labelledby="[^"]+-label"/);
  });

  it('should preserve caller group labeling', () => {
    const html = renderToStringSync(() => (
      <Select>
        <SelectGroup aria-labelledby="caller-label">
          <WrappedLabel />
        </SelectGroup>
        <span id="caller-label">Caller</span>
      </Select>
    ));
    expect(groupTag(html)).toContain('aria-labelledby="caller-label"');
  });

  it('should associate a literal group label in server markup', () => {
    const html = renderToStringSync(() => <LabelledSelect />);
    expect(groupTag(html)).toMatch(/aria-labelledby="[^"]+-label"/);
  });
  it('should associate a wrapped group label in server markup', () => {
    const html = renderToStringSync(() => <LabelledSelect wrapped />);
    expect(html).toContain('Frameworks');
    expect(groupTag(html)).toMatch(/aria-labelledby="[^"]+-label"/);
  });
  it('should not reference a missing group label in server markup', () => {
    const html = renderToStringSync(() => <LabelledSelect unlabelled />);
    expect(groupTag(html)).not.toContain('aria-labelledby');
  });
});
