/**
 * createLayer
 *
 * Manages stacking order and coordination for overlays (modals, popovers, etc).
 */
export interface LayerOptions {
    onEscape?: () => void;
    onOutsidePointer?: (e: PointerEvent) => void;
    node?: Node | null;
}
export interface Layer {
    id: number;
    isTop(): boolean;
    unregister(): void;
}
export interface LayerManager {
    register(options: LayerOptions): Layer;
    layers(): ReadonlyArray<Layer>;
    handleEscape(): void;
    handleOutsidePointer(e: PointerEvent): void;
}
export declare function createLayer(): LayerManager;
