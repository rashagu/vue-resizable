import * as PropTypes from "./type/PropTypes";
import { vuePropsMake } from "./type/PropTypes";
import Resizable from "./Resizable";
import type { Props, ResizableBoxState, ResizeCallbackData } from "./propTypes";
import { resizableProps } from "./propTypes";
import { defineComponent, nextTick, reactive, useSlots, watch, h } from "vue";

// ElementConfig gives us an object type where all items present in `defaultProps` are made optional.
// <ResizableBox> does not have defaultProps, so we can use this type to tell Flow that we don't
// care about that and will handle it in <Resizable> instead.
// A <ResizableBox> can also have a `style` property.

interface ResizableBoxProps extends Partial<Props> {
  width: number;
  height: number;
  style?: any;
  children: any;
}
const propTypes = {
  ...resizableProps,
  children: PropTypes.element,
};
export const vuePropsType = vuePropsMake(propTypes, {});
const ResizableBox = defineComponent<ResizableBoxProps>((props, { expose }) => {
  const slots = useSlots();
  const state = reactive<ResizableBoxState>({
    width: props.width,
    height: props.height,
    propsWidth: props.width,
    propsHeight: props.height,
  });

  function getDerivedStateFromProps(
    props: ResizableBoxProps,
    state: ResizableBoxState
  ): ResizableBoxState | null {
    // If parent changes height/width, set that in our state.
    if (
      state.propsWidth !== props.width ||
      state.propsHeight !== props.height
    ) {
      return {
        width: props.width,
        height: props.height,
        propsWidth: props.width,
        propsHeight: props.height,
      };
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

  const onResize: (e: any, data: ResizeCallbackData) => void = (e, data) => {
    const { size } = data;
    if (props.onResize) {
      e.persist?.();
      if (size) {
        Object.keys(size).forEach((key) => {
          // @ts-ignore
          state[key] = size[key];
        });
      }
      nextTick(() => {
        props.onResize && props.onResize(e, data);
      });
    } else {
      if (size) {
        Object.keys(size).forEach((key) => {
          // @ts-ignore
          state[key] = size[key];
        });
      }
    }
  };

  return () => {
    // Basic wrapper around a Resizable instance.
    // If you use Resizable directly, you are responsible for updating the child component
    // with a new width and height.
    const {
      handle,
      handleSize,
      onResize: onResizeProps,
      onResizeStart,
      onResizeStop,
      draggableOpts,
      minConstraints,
      maxConstraints,
      lockAspectRatio,
      axis,
      width,
      height,
      resizeHandles,
      style,
      transformScale,
      children,
      ...props_
    } = props;

    return (
      <Resizable
        axis={axis!}
        draggableOpts={draggableOpts}
        handle={handle}
        handleSize={handleSize!}
        height={state.height}
        lockAspectRatio={lockAspectRatio!}
        maxConstraints={maxConstraints!}
        minConstraints={minConstraints!}
        onResizeStart={onResizeStart}
        onResize={onResize}
        onResizeStop={onResizeStop}
        resizeHandles={resizeHandles!}
        transformScale={transformScale!}
        width={state.width}
        children={
          <div
            {...props_}
            style={{
              ...style,
              width: state.width + "px",
              height: state.height + "px",
            }}
          >
            {children}
          </div>
        }
      ></Resizable>
    );
  };
});

ResizableBox.props = vuePropsType;
ResizableBox.name = "ResizableBox";

export default ResizableBox;
