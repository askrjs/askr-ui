import {
  Progress,
  ProgressIndicator,
} from '../../../../../src/components/progress';
import { mount } from '../../_mount';

export function axeLabelledProgress(root: HTMLElement): void {
  mount(
    <Progress aria-label="Upload progress" value={25} max={100}>
      <ProgressIndicator />
    </Progress>,
    root
  );
}
