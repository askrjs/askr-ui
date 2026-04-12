import { bench, describe } from 'vite-plus/test';
import { Grid, type GridDivProps } from '../../src/components/primitives/grid';

describe('Grid benches', () => {
  bench('create default grid', () => {
    Grid({ children: 'bench' } as unknown as GridDivProps);
  });

  bench('create configured grid layout', () => {
    Grid({
      columns: 3,
      gap: '16px',
      align: 'stretch',
      justify: 'center',
      children: [<div>A</div>, <div>B</div>, <div>C</div>],
    } as unknown as GridDivProps);
  });

  bench('create auto-fit grid layout', () => {
    Grid({
      minItemWidth: '12rem',
      autoFit: true,
      gap: '12px',
      children: [<div>A</div>, <div>B</div>, <div>C</div>, <div>D</div>],
    } as unknown as GridDivProps);
  });
});
