// @flow
import { isNum, int } from "./shims";
import {
  getTouch,
  innerWidth,
  innerHeight,
  offsetXYFromParent,
  outerWidth,
  outerHeight,
} from "./domFns";

import type {
  Bounds,
  ControlPosition,
  DraggableData,
  MouseTouchEvent,
} from "./types";
import type { ComponentInternalInstance } from "vue";

export function getBoundPosition(
  draggable: ComponentInternalInstance,
  x: number,
  y: number
): [number, number] {
  // If no bounds, short-circuit and move on
  if (!draggable.props.bounds) return [x, y];

  let { bounds }:any = draggable.props;
  bounds = typeof bounds === "string" ? bounds : cloneBounds(bounds);
  const node = findDOMNode(draggable);

  if (typeof bounds === "string") {
    const { ownerDocument } = node;
    const ownerWindow = ownerDocument.defaultView!;
    let boundNode;
    if (bounds === "parent") {
      boundNode = node.parentNode;
    } else {
      boundNode = ownerDocument.querySelector(bounds);
    }
    if (!(boundNode instanceof ownerWindow.HTMLElement)) {
      throw new Error(
        'Bounds selector "' + bounds + '" could not find an element.'
      );
    }
    const boundNodeEl: HTMLElement = boundNode; // for Flow, can't seem to refine correctly
    const nodeStyle = ownerWindow.getComputedStyle(node);
    const boundNodeStyle = ownerWindow.getComputedStyle(boundNodeEl);
    // Compute bounds. This is a pain with padding and offsets but this gets it exactly right.
    bounds = {
      left:
        -node.offsetLeft +
        int(boundNodeStyle.paddingLeft) +
        int(nodeStyle.marginLeft),
      top:
        -node.offsetTop +
        int(boundNodeStyle.paddingTop) +
        int(nodeStyle.marginTop),
      right:
        innerWidth(boundNodeEl) -
        outerWidth(node) -
        node.offsetLeft +
        int(boundNodeStyle.paddingRight) -
        int(nodeStyle.marginRight),
      bottom:
        innerHeight(boundNodeEl) -
        outerHeight(node) -
        node.offsetTop +
        int(boundNodeStyle.paddingBottom) -
        int(nodeStyle.marginBottom),
    };
  }

  // Keep x and y below right and bottom limits...
  if (isNum(bounds.right)) x = Math.min(x, bounds.right);
  if (isNum(bounds.bottom)) y = Math.min(y, bounds.bottom);

  // But above left and top limits.
  if (isNum(bounds.left)) x = Math.max(x, bounds.left);
  if (isNum(bounds.top)) y = Math.max(y, bounds.top);

  return [x, y];
}

export function snapToGrid(
  grid: [number, number],
  pendingX: number,
  pendingY: number
): [number, number] {
  const x = Math.round(pendingX / grid[0]) * grid[0];
  const y = Math.round(pendingY / grid[1]) * grid[1];
  return [x, y];
}

export function canDragX(draggable: ComponentInternalInstance): boolean {
  return draggable.props.axis === "both" || draggable.props.axis === "x";
}

export function canDragY(draggable: ComponentInternalInstance): boolean {
  return draggable.props.axis === "both" || draggable.props.axis === "y";
}

// Get {x, y} positions from event.
export function getControlPosition(
  e: MouseTouchEvent,
  touchIdentifier: number,
  draggableCore: ComponentInternalInstance
): ControlPosition | null {
  const touchObj =
    typeof touchIdentifier === "number" ? getTouch(e, touchIdentifier) : null;
  if (typeof touchIdentifier === "number" && !touchObj) return null; // not the right touch
  const node = findDOMNode(draggableCore);
  // User can provide an offsetParent if desired.
  const offsetParent =
    draggableCore.props.offsetParent ||
    node.offsetParent ||
    node.ownerDocument.body;
  return offsetXYFromParent(
    touchObj || e,
    // @ts-ignore
    offsetParent,
    draggableCore.props.scale
  );
}

// Create an data object exposed by <DraggableCore>'s events
export function createCoreData(
  draggable: ComponentInternalInstance,
  x: number,
  y: number
): DraggableData {
  const state = draggable.exposed!.state;
  const isStart = !isNum(state.lastX);
  const node = findDOMNode(draggable);

  if (isStart) {
    // If this is our first move, use the x and y as last coords.
    return {
      node,
      deltaX: 0,
      deltaY: 0,
      lastX: x,
      lastY: y,
      x,
      y,
    };
  } else {
    // Otherwise calculate proper values.
    return {
      node,
      deltaX: x - state.lastX,
      deltaY: y - state.lastY,
      lastX: state.lastX,
      lastY: state.lastY,
      x,
      y,
    };
  }
}

// Create an data exposed by <Draggable>'s events
export function createDraggableData(
  draggable: ComponentInternalInstance,
  coreData: DraggableData
): DraggableData {
  const scale: any = draggable.props.scale;
  return {
    node: coreData.node,
    x: draggable.exposed!.state.x + coreData.deltaX / scale,
    y: draggable.exposed!.state.y + coreData.deltaY / scale,
    deltaX: coreData.deltaX / scale,
    deltaY: coreData.deltaY / scale,
    lastX: draggable.exposed!.state.x,
    lastY: draggable.exposed!.state.y,
  };
}

// A lot faster than stringify/parse
function cloneBounds(bounds: Bounds): Bounds {
  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom,
  };
}

function findDOMNode(draggable: ComponentInternalInstance): HTMLElement {
  // @ts-ignore
  const node = draggable?.ctx?.$el;
  if (!node) {
    throw new Error("<DraggableCore>: Unmounted during event!");
  }
  // $FlowIgnore we can't assert on HTMLElement due to tests... FIXME
  return node as HTMLElement;
}
