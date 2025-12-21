// Minimal JSX typings for the custom `askr-jsx` runtime
// Provides a simple `JSX.IntrinsicElements` so intrinsic elements like <span> are allowed

declare global {
  namespace JSX {
    // Allow any HTML/SVG tag with any props
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    // Represent a JSX element - keep as `any` to keep things permissive for now
    type Element = any;

    // Other compatible hooks used by TSX type checking
    interface ElementClass {}
    interface ElementAttributesProperty {
      props: any;
    }
    interface IntrinsicAttributes {
      [key: string]: any;
    }
  }
}

export {};
