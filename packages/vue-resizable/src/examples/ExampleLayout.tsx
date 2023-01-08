import Resizable from "../lib/Resizable";
import ResizableBox from "../lib/ResizableBox";
import "../css/styles.css";
import "./example.css";
import { defineComponent, reactive, useSlots } from "vue";
import type { ResizeCallbackData } from "@/lib/propTypes";

const CustomResizeHandle = defineComponent<{ ref: any }>((props, { attrs }) => {
  const slots = useSlots();
  return () => {
    const { handleAxis, ...restProps } = attrs;
    console.log(props);
    return (
      <div
        class={`custom-handle custom-handle-${handleAxis} custom-resize-handle-component`}
        ref={props.ref}
        {...restProps}
      ></div>
    );
  };
});
CustomResizeHandle.props = {
  ref: { type: [Object, Function] },
};

interface ExampleLayoutProps {
  name?: string;
}

export const vuePropsType = {
  name: String,
};
const ExampleLayout = defineComponent<ExampleLayoutProps>(
  (props, { expose }) => {
    const slots = useSlots();

    const state = reactive({
      width: 200,
      height: 200,
      absoluteWidth: 200,
      absoluteHeight: 200,
      absoluteLeft: 0,
      absoluteTop: 0,
    });

    const onResetClick = () => {
      state.width = 200;
      state.height = 200;
      state.absoluteWidth = 200;
      state.absoluteHeight = 200;
    };

    // On top layout
    const onFirstBoxResize: (e: any, data: ResizeCallbackData) => any = (
      event,
      { node, size, handle }
    ) => {
      state.width = size.width;
      state.height = size.height;
    };

    // On bottom layout. Used to resize the center element around its flex parent.
    const onResizeAbsolute: (e: any, data: ResizeCallbackData) => any = (
      event,
      { node, size, handle }
    ) => {
      let newLeft = state.absoluteLeft;
      let newTop = state.absoluteTop;
      const deltaHeight = size.height - state.absoluteHeight;
      const deltaWidth = size.width - state.absoluteWidth;
      if (handle[0] === "n") {
        newTop -= deltaHeight;
      } else if (handle[0] === "s") {
        newTop += deltaHeight;
      }
      if (handle[handle.length - 1] === "w") {
        newLeft -= deltaWidth;
      } else if (handle[handle.length - 1] === "e") {
        newLeft += deltaWidth;
      }

      state.absoluteWidth = size.width;
      state.absoluteHeight = size.height;
      state.absoluteLeft = newLeft;
      state.absoluteTop = newTop;
    };

    return () => {
      return (
        <div>
          <h3>Statically Positioned Layout</h3>
          <div class="layoutRoot">
            {/*// @ts-ignore*/}
            <Resizable
              class="box"
              height={state.height}
              width={state.width}
              onResize={onFirstBoxResize}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={
                <div
                  style={{
                    width: state.width + "px",
                    height: state.height + "px",
                  }}
                >
                  <span class="text">
                    {
                      "Raw use of <Resizable> element. 200x200, all Resize Handles."
                    }
                  </span>
                  <button onClick={onResetClick} style={{ marginTop: "10px" }}>
                    Reset this element's width/height
                  </button>
                </div>
              }
            ></Resizable>
            <ResizableBox
              class="box"
              width={200}
              height={200}
              children={<span class="text">{"<ResizableBox>"}</span>}
            ></ResizableBox>
            <ResizableBox
              class="custom-box box"
              width={200}
              height={200}
              handle={<span class="custom-handle custom-handle-se" />}
              handleSize={[8, 8]}
              children={
                <span class="text">
                  {
                    "<ResizableBox> with custom overflow style & handle in SE corner."
                  }
                </span>
              }
            ></ResizableBox>
            <ResizableBox
              class="custom-box box"
              width={200}
              height={200}
              handle={<CustomResizeHandle />}
              handleSize={[8, 8]}
              children={
                <span class="text">
                  {"<ResizableBox> with a custom resize handle component."}
                </span>
              }
            ></ResizableBox>
            <ResizableBox
              class="custom-box box"
              width={200}
              height={200}
              handle={(h: any, ref: any) => (
                <span class={`custom-handle custom-handle-${h}`} ref={ref} />
              )}
              handleSize={[8, 8]}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={
                <span class="text">
                  {"<ResizableBox> with custom handles in all locations."}
                </span>
              }
            ></ResizableBox>
            <ResizableBox
              class="box"
              width={200}
              height={200}
              draggableOpts={{ grid: [25, 25] }}
              children={
                <span class="text">
                  Resizable box that snaps to even intervals of 25px.
                </span>
              }
            ></ResizableBox>
            <ResizableBox
              class="box"
              width={200}
              height={200}
              minConstraints={[150, 150]}
              maxConstraints={[500, 300]}
              children={
                <span class="text">
                  Resizable box, starting at 200x200. Min size is 150x150, max
                  is 500x300.
                </span>
              }
            ></ResizableBox>
            <ResizableBox
              class="box hover-handles"
              width={200}
              height={200}
              minConstraints={[150, 150]}
              maxConstraints={[500, 300]}
              children={
                <span class="text">
                  Resizable box with a handle that only appears on hover.
                </span>
              }
            ></ResizableBox>
            <ResizableBox
              class="box"
              width={200}
              height={200}
              lockAspectRatio={true}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={
                <span class="text">
                  Resizable square with a locked aspect ratio.
                </span>
              }
            ></ResizableBox>
            <ResizableBox
              class="box"
              width={200}
              height={120}
              lockAspectRatio={true}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={
                <span class="text">
                  Resizable rectangle with a locked aspect ratio.
                </span>
              }
            ></ResizableBox>
            <ResizableBox
              class="box"
              width={200}
              height={200}
              axis="x"
              children={<span class="text">Only resizable by "x" axis.</span>}
            ></ResizableBox>
            <ResizableBox
              class="box"
              width={200}
              height={200}
              axis="y"
              children={<span class="text">Only resizable by "y" axis.</span>}
            ></ResizableBox>
            <ResizableBox
              class="box"
              width={200}
              height={200}
              axis="both"
              children={<span class="text">Resizable ("both" axis).</span>}
            ></ResizableBox>
            <ResizableBox
              class="box"
              width={200}
              height={200}
              axis="none"
              children={<span class="text">Not resizable ("none" axis).</span>}
            ></ResizableBox>
          </div>

          <h3>Absolutely Positioned Layout</h3>
          <div class="layoutRoot absoluteLayout">
            <ResizableBox
              class="box absolutely-positioned top-aligned left-aligned"
              height={200}
              width={200}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={<span class="text">Top-left Aligned</span>}
            ></ResizableBox>
            <ResizableBox
              class="box absolutely-positioned bottom-aligned left-aligned"
              height={200}
              width={200}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={<span class="text">Bottom-left Aligned</span>}
            ></ResizableBox>
            {/* See implementation of `onResizeAbsolute` for how this can be moved around its container */}
            {/*// @ts-ignore*/}
            <Resizable
              class="box absolutely-positioned"
              height={state.absoluteHeight}
              width={state.absoluteWidth}
              onResize={onResizeAbsolute}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={
                <div
                  style={{
                    width: state.absoluteWidth,
                    height: state.absoluteHeight,
                    margin: `${state.absoluteTop} 0 0 ${state.absoluteLeft}`,
                  }}
                >
                  <span class="text">
                    {
                      "Raw use of <Resizable> element with controlled position. Resize and reposition in all directions."
                    }
                  </span>
                </div>
              }
            ></Resizable>
            <ResizableBox
              class="box absolutely-positioned top-aligned right-aligned"
              height={200}
              width={200}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={<span class="text">Top-right Aligned</span>}
            ></ResizableBox>
            <ResizableBox
              class="box absolutely-positioned bottom-aligned right-aligned"
              height={200}
              width={200}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={<span class="text">Bottom-right Aligned</span>}
            ></ResizableBox>
          </div>

          <h3>Scaled Absolute Layout</h3>
          <div>
            <small>
              If you are nesting Resizables in an element with{" "}
              <code>transform: scale(n)</code>, be sure to pass the same{" "}
              <code>n</code>&nbsp; as the <code>transformScale</code> property.
              <br />
              This box has scale 0.75.
            </small>
          </div>
          <div class="layoutRoot absoluteLayout scaledLayout">
            <ResizableBox
              class="box absolutely-positioned top-aligned left-aligned"
              width={200}
              height={200}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={
                <span class="text">
                  {"<ResizableBox> with incorrect scale 1"}
                </span>
              }
            ></ResizableBox>

            <ResizableBox
              class="box absolutely-positioned bottom-aligned left-aligned"
              width={200}
              height={200}
              transformScale={0.75}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={
                <span class="text">
                  {"<ResizableBox> with correct scale 0.75"}
                </span>
              }
            ></ResizableBox>

            {/* See implementation of `onResizeAbsolute` for how this can be moved around its container */}
            {/*// @ts-ignore*/}
            <Resizable
              class="box absolutely-positioned"
              height={state.absoluteHeight}
              width={state.absoluteWidth}
              onResize={onResizeAbsolute}
              transformScale={0.75}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={
                <div
                  style={{
                    width: state.absoluteWidth,
                    height: state.absoluteHeight,
                    margin: `${state.absoluteTop} 0 0 ${state.absoluteLeft}`,
                  }}
                >
                  <span class="text">
                    {
                      "Raw use of <Resizable> element with controlled position. Resize and reposition in all directions."
                    }
                  </span>
                </div>
              }
            ></Resizable>

            <ResizableBox
              class="box absolutely-positioned top-aligned right-aligned"
              width={200}
              height={200}
              transformScale={0.75}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={
                <span class="text">
                  {"<ResizableBox> with correct scale 0.75"}
                </span>
              }
            ></ResizableBox>

            <ResizableBox
              class="box absolutely-positioned bottom-aligned right-aligned"
              width={200}
              height={200}
              transformScale={0.75}
              resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
              children={
                <span class="text">
                  {"<ResizableBox> with correct scale 0.75"}
                </span>
              }
            ></ResizableBox>
          </div>
        </div>
      );
    };
  }
);

ExampleLayout.props = vuePropsType;
ExampleLayout.name = "ExampleLayout";

export default ExampleLayout;
