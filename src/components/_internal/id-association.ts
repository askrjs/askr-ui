/** Update an automatically managed ARIA link after its part nodes commit. */
export function syncIdAssociation(
  source: HTMLElement | null,
  target: HTMLElement | null,
  attribute: 'aria-controls' | 'aria-labelledby' | 'aria-describedby',
  automatic: boolean
) {
  if (source && target && automatic) {
    if (target.id) source.setAttribute(attribute, target.id);
    else source.removeAttribute(attribute);
  }
}
