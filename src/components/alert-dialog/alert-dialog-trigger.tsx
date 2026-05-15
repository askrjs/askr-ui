import { DialogTrigger } from '../dialog';
import { readDialogRootContext } from '../dialog/dialog.shared';
import type {
  AlertDialogTriggerAsChildProps,
  AlertDialogTriggerProps,
} from './alert-dialog.types';

export function AlertDialogTrigger(
  props: AlertDialogTriggerProps | AlertDialogTriggerAsChildProps
) {
  const root = readDialogRootContext();
  const handlePress = (event: {
    defaultPrevented?: boolean;
    preventDefault?: () => void;
  }) => {
    props.onPress?.(event as never);

    if (!event.defaultPrevented && root.open) {
      event.preventDefault?.();
    }
  };

  if (props.asChild) {
    return <DialogTrigger {...props} onPress={handlePress} />;
  }

  return <DialogTrigger {...props} onPress={handlePress} />;
}
