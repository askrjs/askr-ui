let keyboardModality = true;

export function markKeyboardModality() {
  keyboardModality = true;
}

export function markPointerModality() {
  keyboardModality = false;
}

export function isKeyboardModality() {
  return keyboardModality;
}
