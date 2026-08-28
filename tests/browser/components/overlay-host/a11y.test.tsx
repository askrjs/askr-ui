import { describe, it } from 'vite-plus/test';
import { OverlayHost } from '../../../../src/components/overlay-host';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../src/components/popover';
import { expectNoAxeViolations } from '../../accessibility';

describe('OverlayHost - Accessibility', () => {
  it('should preserve the accessibility of a hosted overlay', async () => {
    await expectNoAxeViolations(
      <OverlayHost>
        <Popover defaultOpen>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverContent>Popover body</PopoverContent>
        </Popover>
      </OverlayHost>
    );
  });
});
