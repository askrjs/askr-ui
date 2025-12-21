export function VisuallyHidden(props: { children?: any }) {
  const el = document.createElement('span');
  el.style.position = 'absolute';
  el.style.width = '1px';
  el.style.height = '1px';
  el.style.margin = '-1px';
  el.style.padding = '0';
  el.style.border = '0';
  el.style.overflow = 'hidden';
  el.style.clip = 'rect(0 0 0 0)';
  el.style.whiteSpace = 'nowrap';
  if (props.children != null) {
    if (typeof props.children === 'string') el.textContent = props.children;
    else el.appendChild(props.children);
  }
  return el;
}
