/** Every widget module default-exports nothing and named-exports `mount`. */
export type WidgetOpts = Record<string, unknown>;
export type WidgetCleanup = () => void;
export type WidgetMount = (el: HTMLElement, opts: WidgetOpts) => WidgetCleanup;
export interface WidgetModule {
  mount: WidgetMount;
}
