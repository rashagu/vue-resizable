import * as PropTypes from "./type/PropTypes";

export type ReactRef<T> = {
  current: T | null;
};

export type Axis = "both" | "x" | "y" | "none";
export type ResizeHandleAxis =
  | "s"
  | "w"
  | "e"
  | "n"
  | "sw"
  | "nw"
  | "se"
  | "ne";
export type ResizableState = void;
export type ResizableBoxState = {
  width: number;
  height: number;
  propsWidth: number;
  propsHeight: number;
};
export type DragCallbackData = {
  node: HTMLElement;
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  lastX: number;
  lastY: number;
};
export type ResizeCallbackData = {
  node: HTMLElement;
  size: { width: number; height: number };
  handle: ResizeHandleAxis;
};

// <Resizable>
export type DefaultProps = {
  axis: Axis;
  handleSize: [number, number];
  lockAspectRatio: boolean;
  minConstraints: [number, number];
  maxConstraints: [number, number];
  resizeHandles: ResizeHandleAxis[];
  transformScale: number;
};

export interface Props extends DefaultProps {
  children: any;
  className?: string;
  draggableOpts?: any;
  height: number;
  handle?: any;
  onResizeStop?: (e: any, data: ResizeCallbackData) => any;
  onResizeStart?: (e: any, data: ResizeCallbackData) => any;
  onResize?: (e: any, data: ResizeCallbackData) => any;
  width: number;
}

export const resizableProps = {
  /*
   * Restricts resizing to a particular axis (default: 'both')
   * 'both' - allows resizing by width or height
   * 'x' - only allows the width to be changed
   * 'y' - only allows the height to be changed
   * 'none' - disables resizing altogether
   * */
  axis: PropTypes.string,
  className: PropTypes.string,
  /*
   * Require that one and only one child be present.
   * */
  children: PropTypes.any,
  /*
   * These will be passed wholesale to react-draggable's DraggableCore
   * */
  draggableOpts: PropTypes.object,
  /*
   * Initial height
   * */
  height: PropTypes.number,
  /*
   * Customize cursor resize handle
   * */
  handle: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  /*
   * If you change this, be sure to update your css
   * */
  handleSize: PropTypes.array,
  lockAspectRatio: PropTypes.bool,
  /*
   * Max X & Y measure
   * */
  maxConstraints: PropTypes.array,
  /*
   * Min X & Y measure
   * */
  minConstraints: PropTypes.array,
  /*
   * Called on stop resize event
   * */
  onResizeStop: PropTypes.func,
  /*
   * Called on start resize event
   * */
  onResizeStart: PropTypes.func,
  /*
   * Called on resize event
   * */
  onResize: PropTypes.func,
  /*
   * Defines which resize handles should be rendered (default: 'se')
   * 's' - South handle (bottom-center)
   * 'w' - West handle (left-center)
   * 'e' - East handle (right-center)
   * 'n' - North handle (top-center)
   * 'sw' - Southwest handle (bottom-left)
   * 'nw' - Northwest handle (top-left)
   * 'se' - Southeast handle (bottom-right)
   * 'ne' - Northeast handle (top-center)
   * */
  resizeHandles: PropTypes.array,

  /*
   * If `transform: scale(n)` is set on the parent, this should be set to `n`.
   * */
  transformScale: PropTypes.number,
  /*
   * Initial width
   */
  width: PropTypes.number,
};
