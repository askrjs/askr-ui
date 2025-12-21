export function isActivationKey(e: KeyboardEvent) {
  const k = e.key;
  return k === 'Enter' || k === ' ' || k === 'Spacebar';
}