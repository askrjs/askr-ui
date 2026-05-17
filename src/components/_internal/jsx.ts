import type { JSXElement } from '@askrjs/askr/foundations/structures';

export function isJsxElement(value: unknown): value is JSXElement {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$$typeof' in value &&
    'props' in value
  );
}

export function hasJsxIntrinsicType(
  value: unknown,
  expectedType: string
): value is JSXElement {
  return isJsxElement(value) && value.type === expectedType;
}

export function toChildArray(children: unknown): unknown[] {
  if (Array.isArray(children)) {
    return children;
  }

  return children === undefined || children === null ? [] : [children];
}

export function mapJsxTree(
  children: unknown,
  mapper: (element: JSXElement) => unknown
): unknown {
  if (Array.isArray(children)) {
    return children.map((child) => mapJsxTree(child, mapper));
  }

  if (!isJsxElement(children)) {
    return children;
  }

  const mapped = mapper(children);

  if (!isJsxElement(mapped)) {
    return mapped;
  }

  const currentChildren = mapped.props?.children;
  const nextChildren = mapJsxTree(currentChildren, mapper);

  if (nextChildren === currentChildren) {
    return mapped;
  }

  return {
    ...mapped,
    props: {
      ...mapped.props,
      children: nextChildren,
    },
  };
}

export function collectJsxElements(
  children: unknown,
  predicate?: (element: JSXElement) => boolean
): JSXElement[] {
  const result: JSXElement[] = [];

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!isJsxElement(value)) {
      return;
    }

    if (!predicate || predicate(value)) {
      result.push(value);
    }

    visit(value.props?.children);
  };

  visit(children);

  return result;
}

export function extractTextContent(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((entry) => extractTextContent(entry)).join('');
  }

  if (
    value === undefined ||
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'function'
  ) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (isJsxElement(value)) {
    return extractTextContent(value.props?.children);
  }

  return '';
}

export function serializeForId(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '';
    }

    let serialized = '';

    for (let index = 0; index < value.length; index += 1) {
      if (index > 0) {
        serialized += '|';
      }

      serialized += serializeForId(value[index]);
    }

    return serialized;
  }

  if (value === undefined || value === null || typeof value === 'boolean') {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (isJsxElement(value)) {
    const typeName =
      typeof value.type === 'string'
        ? value.type
        : typeof value.type === 'function'
          ? value.type.name || 'component'
          : 'component';
    const props = value.props ?? {};
    const propEntries: string[] = [];

    for (const key in props) {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        continue;
      }

      if (key === 'children' || key === 'ref' || key.startsWith('on')) {
        continue;
      }

      const entryValue = props[key as keyof typeof props];

      if (
        typeof entryValue === 'string' ||
        typeof entryValue === 'number' ||
        typeof entryValue === 'boolean'
      ) {
        propEntries.push(`${key}:${String(entryValue)}`);
      }
    }

    propEntries.sort((left, right) => left.localeCompare(right));

    let serializedProps = '';

    for (let index = 0; index < propEntries.length; index += 1) {
      if (index > 0) {
        serializedProps += ',';
      }

      serializedProps += propEntries[index];
    }

    return `${typeName}[${serializedProps}](${serializeForId(value.props?.children)})`;
  }

  return typeof value;
}
