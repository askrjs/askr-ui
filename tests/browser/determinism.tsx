import { expect } from 'vite-plus/test';
import { mount, resetTestState, unmount } from './test-utils';

export function renderHtml(element: JSX.Element) {
  resetTestState();
  const container = mount(element);

  try {
    return container.innerHTML;
  } finally {
    unmount(container);
  }
}

function normalizeDeterministicMarkup(html: string) {
  return html.replace(/ data-key="Symbol\(AskrContext[^"]*\)"/g, '');
}

export function expectDeterministicRender(factory: () => JSX.Element) {
  const first = normalizeDeterministicMarkup(renderHtml(factory()));
  const second = normalizeDeterministicMarkup(renderHtml(factory()));

  expect(first).toBe(second);
}
