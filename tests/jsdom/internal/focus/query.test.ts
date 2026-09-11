import { describe, expect, it } from 'vite-plus/test';
import {
  getFocusableElements,
  getTabbableElements,
} from '../../../../src/components/_internal/focus/query';

describe('focusable/tabbable DOM queries', () => {
  it('should collect naturally focusable and tabindex-bearing descendants, skipping disabled ones', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <button id="a">A</button>
      <button id="b" disabled>B</button>
      <div id="c" tabindex="0">C</div>
      <span id="d">D</span>
    `;
    document.body.appendChild(root);

    const ids = getFocusableElements(root).map((el) => el.id);
    expect(ids).toEqual(['a', 'c']);

    root.remove();
  });

  it('should order positive tabindex elements ahead of natural-order zero-tabindex elements', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <button id="first">first</button>
      <button id="second" tabindex="2">second</button>
      <button id="third" tabindex="1">third</button>
    `;
    document.body.appendChild(root);

    const ids = getTabbableElements(root).map((el) => el.id);
    expect(ids).toEqual(['third', 'second', 'first']);

    root.remove();
  });

  it('should exclude elements inside a disabled fieldset except the first legend', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <fieldset disabled>
        <legend><button id="legend-btn">in legend</button></legend>
        <button id="inside">inside</button>
      </fieldset>
    `;
    document.body.appendChild(root);

    const ids = getFocusableElements(root).map((el) => el.id);
    expect(ids).toEqual(['legend-btn']);

    root.remove();
  });
});
