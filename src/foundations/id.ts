let uid = 0;
export function generateId(prefix = 'askr') {
  uid += 1;
  return `${prefix}-${uid}`;
}

export function useId(prefix = 'askr') {
  return generateId(prefix);
}
