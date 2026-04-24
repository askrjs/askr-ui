declare global {
  namespace JSX {
    interface Element {
      $$typeof: symbol;
      type: string | ((props: Record<string, unknown>) => unknown) | symbol;
      props: Record<string, unknown>;
      key?: string | number | null;
      readonly __askrJsxElementBrand?: never;
    }

    interface IntrinsicElements {
      [elem: string]: Record<string, unknown>;
    }

    interface ElementAttributesProperty {
      props: Record<string, unknown>;
    }

    interface ElementChildrenAttribute {
      children: unknown;
    }
  }
}

export {};
