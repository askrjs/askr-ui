import { describe, it } from 'vite-plus/test';
import { OverlayHost } from '../../../../src/components/overlay-host';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../src/components/popover';
import { expectDeterministicRender } from '../../determinism';

describe('OverlayHost - Determinism', () => {
  it('should render deterministic hosted overlay markup', () => {
    expectDeterministicRender(() => (
      <OverlayHost>
        <Popover defaultOpen>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverContent>Popover body</PopoverContent>
        </Popover>
      </OverlayHost>
    ));
  });
});
