import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../../../../../src/components/select';
import { OverlayHost } from '../../../../../src/components/overlay-host';
import { mount } from '../../_mount';

export default function selectPortal(root: HTMLElement) {
  mount(
    <OverlayHost>
      <Select>
        <SelectTrigger aria-label="Framework">
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="askr">Askr</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    </OverlayHost>,
    root
  );
}
