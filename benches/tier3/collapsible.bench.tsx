import { bench, describe } from 'vite-plus/test';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '../../src/components';

describe('Collapsible benches - closed', () => {
  bench('create closed collapsible', () => {
    Collapsible({
      children: [
        CollapsibleTrigger({ children: 'Toggle' }),
        CollapsibleContent({ children: 'Content' }),
      ],
    });
  });
});

describe('Collapsible benches - open', () => {
  bench('create open collapsible', () => {
    Collapsible({
      defaultOpen: true,
      children: [
        CollapsibleTrigger({ children: 'Toggle' }),
        CollapsibleContent({ children: 'Content' }),
      ],
    });
  });
});

describe('Collapsible benches - disabled', () => {
  bench('create disabled collapsible', () => {
    Collapsible({
      disabled: true,
      children: [
        CollapsibleTrigger({ children: 'Toggle' }),
        CollapsibleContent({ children: 'Content' }),
      ],
    });
  });
});

describe('Collapsible benches - forceMount', () => {
  bench('create with forceMount', () => {
    Collapsible({
      defaultOpen: false,
      children: [
        CollapsibleTrigger({ children: 'Toggle' }),
        CollapsibleContent({ forceMount: true, children: 'Content' }),
      ],
    });
  });
});

describe('Collapsible benches - state toggle', () => {
  bench('state toggle - open to closed to open', () => {
    const onOpenChange = (_open: boolean) => {
      // Simulates state change
    };
    Collapsible({
      open: false,
      onOpenChange,
      children: [
        CollapsibleTrigger({ children: 'Toggle' }),
        CollapsibleContent({ children: 'Content' }),
      ],
    });
    onOpenChange(true);
    onOpenChange(false);
    onOpenChange(true);
  });
});
