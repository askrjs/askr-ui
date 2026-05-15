import { bench, describe } from 'vite-plus/test';
import { FocusScope } from '../../src/components/focus-scope';

describe('FocusScope benches', () => {
  bench('create default focus scope', () => {
    FocusScope({
      restoreFocus: true,
      children: [
        <button type="button">First</button>,
        <button type="button">Second</button>,
      ],
    });
  });

  bench('create looping focus scope', () => {
    FocusScope({
      loop: true,
      children: [
        <button type="button">First</button>,
        <button type="button">Second</button>,
      ],
    });
  });

  bench('create trapped focus scope', () => {
    FocusScope({
      trapped: true,
      children: [
        <button type="button">First</button>,
        <button type="button">Second</button>,
      ],
    });
  });
});
