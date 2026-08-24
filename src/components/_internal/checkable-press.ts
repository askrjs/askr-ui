import {
  pressable,
  type PressableOptions,
} from '@askrjs/askr/foundations/interactions';

type CheckablePressOptions = {
  disabled: boolean;
  onPress: NonNullable<PressableOptions['onPress']>;
};

/** Apply click and Space activation without generic button Enter semantics. */
export function checkablePress(options: CheckablePressOptions) {
  const interaction = pressable({
    ...options,
    isNativeButton: false,
  });
  const handleKeyDown = interaction.onKeyDown;

  return {
    ...interaction,
    onKeyDown: (event: KeyboardEvent) => {
      if (!options.disabled && event.key === 'Enter') {
        event.preventDefault();
        return;
      }
      handleKeyDown?.(event);
    },
  };
}
