import * as PropTypes from "./type/PropTypes";
import clsx from "clsx";
import { createCSSTransform, createSVGTransform } from "./utils/domFns";
import {
  canDragX,
  canDragY,
  createDraggableData,
  getBoundPosition,
} from "./utils/positionFns";
import { dontSetMe } from "./utils/shims";
import DraggableCore, {
  vuePropsType as DraggableCoreVuePropsType,
  defaultProps as CoreDefaultProps,
} from "./DraggableCore";
import type {
  ControlPosition,
  PositionOffsetControlPosition,
  DraggableCoreProps,
  DraggableCoreDefaultProps,
} from "./DraggableCore";
import log from "./utils/log";
import type { Bounds, DraggableEventHandler } from "./utils/types";
import {
  cloneVNode,
  defineComponent,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  reactive,
  useSlots,
  watch,
  h
} from "vue";
import { vuePropsMake } from "./type/PropTypes";

type DraggableState = {
  dragging: boolean;
  dragged: boolean;
  x: number;
  y: number;
  slackX: number;
  slackY: number;
  isElementSVG: boolean;
  prevPropsPosition: ControlPosition;
};

export interface DraggableDefaultProps extends DraggableCoreDefaultProps {
  axis: "both" | "x" | "y" | "none";
  bounds: Bounds | string | false;
  defaultClassName: string;
  defaultClassNameDragging: string;
  defaultClassNameDragged: string;
  defaultPosition: ControlPosition;
  scale: number;
}

export interface DraggableProps
  extends DraggableCoreProps,
    DraggableDefaultProps {
  positionOffset: PositionOffsetControlPosition;
  position: ControlPosition;
}

//
// Define <Draggable>
//

const propTypes = {
  // Accepts all props <DraggableCore> accepts.
  ...DraggableCoreVuePropsType,

  /**
   * `axis` determines which axis the draggable can move.
   *
   *  Note that all callbacks will still return data as normal. This only
   *  controls flushing to the DOM.
   *
   * 'both' allows movement horizontally and vertically.
   * 'x' limits movement to horizontal axis.
   * 'y' limits movement to vertical axis.
   * 'none' limits all movement.
   *
   * Defaults to 'both'.
   */
  axis: PropTypes.string,

  /**
   * `bounds` determines the range of movement available to the element.
   * Available values are:
   *
   * 'parent' restricts movement within the Draggable's parent node.
   *
   * Alternatively, pass an object with the following properties, all of which are optional:
   *
   * {left: LEFT_BOUND, right: RIGHT_BOUND, bottom: BOTTOM_BOUND, top: TOP_BOUND}
   *
   * All values are in px.
   *
   * Example:
   *
   * ```jsx
   *   let App = React.createClass({
   *       render: function () {
   *         return (
   *            <Draggable bounds={{right: 300, bottom: 300}}>
   *              <div>Content</div>
   *           </Draggable>
   *         );
   *       }
   *   });
   * ```
   */
  bounds: PropTypes.any,

  defaultClassName: PropTypes.string,
  defaultClassNameDragging: PropTypes.string,
  defaultClassNameDragged: PropTypes.string,

  /**
   * `defaultPosition` specifies the x and y that the dragged item should start at
   *
   * Example:
   *
   * ```jsx
   *      let App = React.createClass({
   *          render: function () {
   *              return (
   *                  <Draggable defaultPosition={{x: 25, y: 25}}>
   *                      <div>I start with transformX: 25px and transformY: 25px;</div>
   *                  </Draggable>
   *              );
   *          }
   *      });
   * ```
   */
  defaultPosition: PropTypes.object,
  positionOffset: PropTypes.object,

  /**
   * `position`, if present, defines the current position of the element.
   *
   *  This is similar to how form elements in React work - if no `position` is supplied, the component
   *  is uncontrolled.
   *
   * Example:
   *
   * ```jsx
   *      let App = React.createClass({
   *          render: function () {
   *              return (
   *                  <Draggable position={{x: 25, y: 25}}>
   *                      <div>I start with transformX: 25px and transformY: 25px;</div>
   *                  </Draggable>
   *              );
   *          }
   *      });
   * ```
   */
  position: PropTypes.object,

  /**
   * These properties should be defined on the child, not here.
   */
  className: PropTypes.string,
  style: PropTypes.object,
  transform: PropTypes.object,
};

const defaultProps: DraggableDefaultProps = {
  ...CoreDefaultProps,
  axis: "both",
  bounds: false,
  defaultClassName: "react-draggable",
  defaultClassNameDragging: "react-draggable-dragging",
  defaultClassNameDragged: "react-draggable-dragged",
  defaultPosition: { x: 0, y: 0 },
  scale: 1,
};
export const vuePropsType = vuePropsMake(propTypes, defaultProps);
const Draggable = defineComponent<DraggableProps>((props, { expose }) => {
  const slots = useSlots();
  const instance = getCurrentInstance()!;

  const state = reactive<DraggableState>({
    // Whether or not we are currently dragging.
    dragging: false,

    // Whether or not we have been dragged before.
    dragged: false,

    // Current transform x and y.
    x: props.position ? props.position.x : props.defaultPosition.x,
    y: props.position ? props.position.y : props.defaultPosition.y,

    prevPropsPosition: { ...props.position },

    // Used for compensating for out-of-bounds drags
    slackX: 0,
    slackY: 0,

    // Can only determine if SVG after mounting
    isElementSVG: false,
  });

  watch([], () => {
    if (props.position && !(props.onDrag || props.onStop)) {
      // eslint-disable-next-line no-console
      console.warn(
        "A `position` was applied to this <Draggable>, without drag handlers. This will make this " +
          "component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the " +
          "`position` of this element."
      );
    }
  });
  function getDerivedStateFromProps(
    { position }: DraggableProps,
    { prevPropsPosition }: DraggableState
  ): DraggableState | null {
    // Set x/y if a new position is provided in props that is different than the previous.
    if (
      position &&
      (!prevPropsPosition ||
        position.x !== prevPropsPosition.x ||
        position.y !== prevPropsPosition.y)
    ) {
      log("Draggable: getDerivedStateFromProps %j", {
        position,
        prevPropsPosition,
      });
      return {
        x: position.x,
        y: position.y,
        prevPropsPosition: { ...position },
      } as DraggableState;
    }
    return null;
  }
  watch(
    () => props,
    () => {
      const newState = getDerivedStateFromProps(props, state);
      if (newState) {
        Object.keys(newState).forEach((key) => {
          // @ts-ignore
          state[key] = newState[key];
        });
      }
    },
    { deep: true }
  );

  onMounted(() => {
    // Check to see if the element passed is an instanceof SVGElement
    if (
      typeof window.SVGElement !== "undefined" &&
      findDOMNode() instanceof window.SVGElement
    ) {
      state.isElementSVG = true;
    }
  });

  onBeforeUnmount(() => {
    state.isElementSVG = false;
  });

  // React Strict Mode compatibility: if `nodeRef` is passed, we will use it instead of trying to find
  // the underlying DOM node ourselves. See the README for more information.
  function findDOMNode() {
    return (
      props?.nodeRef?.value ||
      // @ts-ignore
      instance.ctx.$el
    );
  }

  const onDragStart: DraggableEventHandler = (e, coreData) => {
    log("Draggable: onDragStart: %j", coreData);

    // Short-circuit if user's callback killed it.
    const shouldStart = props.onStart(
      e,
      createDraggableData(instance, coreData)
    );
    // Kills start event on core as well, so move handlers are never bound.
    if (shouldStart === false) return false;

    state.dragging = true;
    state.dragged = true;
  };

  const onDrag: DraggableEventHandler = (e, coreData) => {
    if (!state.dragging) return false;
    log("Draggable: onDrag: %j", coreData);

    const uiData = createDraggableData(instance, coreData);

    const newState: Partial<DraggableState> = {
      x: uiData.x,
      y: uiData.y,
    };

    // Keep within bounds.
    if (props.bounds) {
      // Save original x and y.
      const { x, y } = newState;

      // Add slack to the values used to calculate bound position. This will ensure that if
      // we start removing slack, the element won't react to it right away until it's been
      // completely removed.
      newState.x! += state.slackX;
      newState.y! += state.slackY;

      // Get bound position. This will ceil/floor the x and y within the boundaries.
      const [newStateX, newStateY] = getBoundPosition(
        instance,
        newState.x!,
        newState.y!
      );
      newState.x = newStateX;
      newState.y = newStateY;

      // Recalculate slack by noting how much was shaved by the boundPosition handler.
      newState.slackX = state.slackX + (x! - newState.x);
      newState.slackY = state.slackY + (y! - newState.y);

      // Update the event we fire to reflect what really happened after bounds took effect.
      uiData.x = newState.x;
      uiData.y = newState.y;
      uiData.deltaX = newState.x - state.x;
      uiData.deltaY = newState.y - state.y;
    }

    // Short-circuit if user's callback killed it.
    const shouldUpdate = props.onDrag(e, uiData);
    if (shouldUpdate === false) return false;
    if (newState) {
      Object.keys(newState).forEach((key) => {
        // @ts-ignore
        state[key] = newState[key];
      });
    }
  };

  const onDragStop: DraggableEventHandler = (e, coreData) => {
    if (!state.dragging) return false;

    // Short-circuit if user's callback killed it.
    const shouldContinue = props.onStop(
      e,
      createDraggableData(instance, coreData)
    );
    if (shouldContinue === false) return false;

    log("Draggable: onDragStop: %j", coreData);

    const newState: Partial<DraggableState> = {
      dragging: false,
      slackX: 0,
      slackY: 0,
    };

    // If this is a controlled component, the result of this operation will be to
    // revert back to the old position. We expect a handler on `onDragStop`, at the least.
    const controlled = Boolean(props.position);
    if (controlled) {
      const { x, y } = props.position;
      newState.x = x;
      newState.y = y;
    }

    if (newState) {
      Object.keys(newState).forEach((key) => {
        // @ts-ignore
        state[key] = newState[key];
      });
    }
  };

  expose({
    state: state,
  });
  return () => {
    const {
      axis,
      bounds,
      children,
      defaultPosition,
      defaultClassName,
      defaultClassNameDragging,
      defaultClassNameDragged,
      position,
      positionOffset,
      scale,
      ...draggableCoreProps
    } = props;

    let style = {};
    let svgTransform = null;

    // If this is controlled, we don't want to move it - unless it's dragging.
    const controlled = Boolean(position);
    const draggable = !controlled || state.dragging;

    const validPosition = position || defaultPosition;
    const transformOpts = {
      // Set left if horizontal drag is enabled
      x: canDragX(instance) && draggable ? state.x : validPosition.x,

      // Set top if vertical drag is enabled
      y: canDragY(instance) && draggable ? state.y : validPosition.y,
    };

    // If this element was SVG, we use the `transform` attribute.
    if (state.isElementSVG) {
      svgTransform = createSVGTransform(transformOpts, positionOffset);
    } else {
      // Add a CSS transform to move the element around. This allows us to move the element around
      // without worrying about whether or not it is relatively or absolutely positioned.
      // If the item you are dragging already has a transform set, wrap it in a <span> so <Draggable>
      // has a clean slate.
      style = createCSSTransform(transformOpts, positionOffset);
    }

    // Mark with class while dragging
    const className = clsx(children.props?.class || "", defaultClassName, {
      [defaultClassNameDragging]: state.dragging,
      [defaultClassNameDragged]: state.dragged,
    });

    // Reuse the child provided
    // This makes it flexible to use whatever element is wanted (div, ul, etc)
    return (
      <DraggableCore
        {...{
          ...draggableCoreProps,
          scale,
          onStart: onDragStart,
          onDrag,
          onStop: onDragStop,
        }}
        children={cloneVNode(children, {
          className: className,
          style: { ...children.props?.style, ...style },
          transform: svgTransform,
        })}
      ></DraggableCore>
    );
  };
});

Draggable.props = vuePropsType;
Draggable.name = "Draggable";
Draggable.v = "Draggable";

export default Draggable;

export { DraggableCore };
