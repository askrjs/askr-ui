import {
  ProgressCircle,
  ProgressCircleIndicator,
} from '../../../../../src/components/progress-circle';
import { mount } from '../../_mount';

export function axeLabelledCircularProgress(root: HTMLElement): void {
  mount(
    <ProgressCircle aria-label="Sync progress" value={50} max={100}>
      <ProgressCircleIndicator />
    </ProgressCircle>,
    root
  );
}
