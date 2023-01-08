import { cloneVNode, defineComponent, reactive, useSlots, h } from "vue";
import * as PropTypes from "../lib/type/PropTypes";
import Draggable from "../lib/Draggable";
import { vuePropsMake } from "../lib/type/PropTypes";
import { omit } from "lodash";

interface AppProps {
  name?: string;
}
const propAppTypes = {};
const defaultAppProps = {};
export const vueAppPropsType = vuePropsMake(propAppTypes, defaultAppProps);
const App = defineComponent<AppProps>((props) => {
  const slots = useSlots();
  const state = reactive({
    activeDrags: 0,
    deltaPosition: {
      x: 0,
      y: 0,
    },
    controlledPosition: {
      x: -400,
      y: 200,
    },
  });
  const handleDrag = (e: any, ui: any) => {
    const { x, y } = state.deltaPosition;
    state.deltaPosition = {
      x: x + ui.deltaX,
      y: y + ui.deltaY,
    };
  };

  const onStart = () => {
    console.log(1)
    state.activeDrags = ++state.activeDrags;
  };

  const onStop = () => {
    state.activeDrags = --state.activeDrags;
  };
  const onDrop = (e: any) => {
    state.activeDrags = --state.activeDrags;
    if (e.target.classList.contains("drop-target")) {
      alert("Dropped!");
      e.target.classList.remove("hovered");
    }
  };
  const onDropAreaMouseEnter = (e: any) => {
    if (state.activeDrags) {
      e.target.classList.add("hovered");
    }
  };
  const onDropAreaMouseLeave = (e: any) => {
    e.target.classList.remove("hovered");
  };

  // For controlled component
  const adjustXPos = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = state.controlledPosition;
    state.controlledPosition = { x: x - 10, y };
  };

  const adjustYPos = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const { controlledPosition } = state;
    const { x, y } = controlledPosition;
    state.controlledPosition = { x, y: y - 10 };
  };

  const onControlledDrag = (e: any, position: any) => {
    const { x, y } = position;
    state.controlledPosition = { x, y };
  };

  const onControlledDragStop = (e: any, position: any) => {
    onControlledDrag(e, position);
    onStop();
  };

  return () => {
    const dragHandlers: any = { onStart: onStart, onStop: onStop };
    const { deltaPosition, controlledPosition } = state;
    return (
      <div>
        <h1>React Draggable</h1>
        <p>Active DragHandlers: {state.activeDrags}</p>
        <p>
          <a href="https://github.com/STRML/react-draggable/blob/master/example/example.js">
            Demo Source
          </a>
        </p>
        <Draggable
          {...dragHandlers}
          children={<div class="box">I can be dragged anywhere</div>}
        ></Draggable>
        <Draggable
          axis="x"
          {...dragHandlers}
          children={
            <div class="box cursor-x">
              I can only be dragged horizonally (x axis)
            </div>
          }
        ></Draggable>
        <Draggable
          axis="y"
          {...dragHandlers}
          children={
            <div class="box cursor-y">
              I can only be dragged vertically (y axis)
            </div>
          }
        ></Draggable>
        {/*// @ts-ignore*/}
        <Draggable
          onStart={() => false}
          children={<div class="box">I don't want to be dragged</div>}
        ></Draggable>
        <Draggable
          {...{
            onDrag: handleDrag,
            ...dragHandlers,
          }}
          children={
            <div class="box">
              <div>I track my deltas</div>
              <div>
                x: {deltaPosition.x.toFixed(0)}, y: {deltaPosition.y.toFixed(0)}
              </div>
            </div>
          }
        ></Draggable>
        <Draggable
          handle="strong"
          {...dragHandlers}
          children={
            <div class="box no-cursor">
              <strong class="cursor">
                <div>Drag here</div>
              </strong>
              <div>You must click my handle to drag me</div>
            </div>
          }
        ></Draggable>
        {/*// @ts-ignore*/}
        <Draggable
          handle="strong"
          children={
            <div
              class="box no-cursor"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <strong class="cursor">
                <div>Drag here</div>
              </strong>
              <div style={{ overflow: "scroll" }}>
                <div style={{ background: "yellow", whiteSpace: "pre-wrap" }}>
                  I have long scrollable content with a handle
                  {"\n" + Array(40).fill("x").join("\n")}
                </div>
              </div>
            </div>
          }
        ></Draggable>
        <Draggable
          cancel="strong"
          {...dragHandlers}
          children={
            <div class="box">
              <strong class="no-cursor">Can't drag here</strong>
              <div>Dragging here works</div>
            </div>
          }
        ></Draggable>
        <Draggable
          grid={[25, 25]}
          {...dragHandlers}
          children={<div class="box">I snap to a 25 x 25 grid</div>}
        ></Draggable>
        <Draggable
          grid={[50, 50]}
          {...dragHandlers}
          children={<div class="box">I snap to a 50 x 50 grid</div>}
        ></Draggable>
        <Draggable
          bounds={{ top: -100, left: -100, right: 100, bottom: 100 }}
          {...dragHandlers}
          children={
            <div class="box">I can only be moved 100px in any direction.</div>
          }
        ></Draggable>
        <Draggable
          {...dragHandlers}
          children={
            <div
              class="box drop-target"
              onMouseenter={onDropAreaMouseEnter}
              onMouseleave={onDropAreaMouseLeave}
            >
              I can detect drops from the next box.
            </div>
          }
        ></Draggable>
        <Draggable
          {...{
            ...dragHandlers,
            onStop: onDrop,
          }}
          children={
            <div class={`box ${state.activeDrags ? "no-pointer-events" : ""}`}>
              I can be dropped onto another box.
            </div>
          }
        ></Draggable>
        <div
          class="box"
          style={{
            height: "500px",
            width: "500px",
            position: "relative",
            overflow: "auto",
            padding: "0",
          }}
        >
          <div style={{ height: "1000px", width: "1000px", padding: "10px" }}>
            <Draggable
              bounds="parent"
              {...dragHandlers}
              children={
                <div class="box">
                  I can only be moved within my offsetParent.
                  <br />
                  <br />
                  Both parent padding and child margin work properly.
                </div>
              }
            ></Draggable>
            <Draggable
              bounds="parent"
              {...dragHandlers}
              children={
                <div class="box">
                  I also can only be moved within my offsetParent.
                  <br />
                  <br />
                  Both parent padding and child margin work properly.
                </div>
              }
            ></Draggable>
          </div>
        </div>
        <Draggable
          bounds="body"
          {...dragHandlers}
          children={
            <div class="box">
              I can only be moved within the confines of the body element.
            </div>
          }
        ></Draggable>
        <Draggable
          {...dragHandlers}
          children={
            <div
              class="box"
              style={{ position: "absolute", bottom: "100px", right: "100px" }}
            >
              I already have an absolute position.
            </div>
          }
        ></Draggable>
        <Draggable
          {...dragHandlers}
          children={
            <RemWrapper
              children={
                <div
                  class="box rem-position-fix"
                  style={{
                    position: "absolute",
                    bottom: "6.25rem",
                    right: "18rem",
                  }}
                >
                  I use <span style={{ fontWeight: 700 }}>rem</span> instead of{" "}
                  <span style={{ fontWeight: 700 }}>px</span> for my transforms.
                  I also have absolute positioning.
                  <br />
                  <br />I depend on a CSS hack to avoid double absolute
                  positioning.
                </div>
              }
            ></RemWrapper>
          }
        ></Draggable>
        <Draggable
          defaultPosition={{ x: 25, y: 25 }}
          {...dragHandlers}
          children={
            <div class="box">
              {
                "I have a default position of {x: 25, y: 25}, so I'm slightly offset."
              }
            </div>
          }
        ></Draggable>
        <Draggable
          positionOffset={{ x: "-10%", y: "-10%" }}
          {...dragHandlers}
          children={
            <div class="box">
              {
                "I have a default position based on percents {x: '-10%', y: '-10%'}, so I'm slightly offset."
              }
            </div>
          }
        ></Draggable>
        <Draggable
          position={controlledPosition}
          {...{
            ...dragHandlers,
            onDrag: onControlledDrag,
          }}
          children={
            <div class="box">
              My position can be changed programmatically. <br />I have a drag
              handler to sync state.
              <div>
                <a href="#" onClick={adjustXPos}>
                  Adjust x ({controlledPosition.x})
                </a>
              </div>
              <div>
                <a href="#" onClick={adjustYPos}>
                  Adjust y ({controlledPosition.y})
                </a>
              </div>
            </div>
          }
        ></Draggable>
        <Draggable
          position={controlledPosition}
          {...{
            ...dragHandlers,
            onStop: onControlledDragStop,
          }}
          children={
            <div class="box">
              My position can be changed programmatically. <br />I have a
              dragStop handler to sync state.
              <div>
                <a href="#" onClick={adjustXPos}>
                  Adjust x ({controlledPosition.x})
                </a>
              </div>
              <div>
                <a href="#" onClick={adjustYPos}>
                  Adjust y ({controlledPosition.y})
                </a>
              </div>
            </div>
          }
        ></Draggable>
      </div>
    );
  };
});

App.props = vueAppPropsType;
App.name = "App";

export default App;

interface RemWrapperProps {
  children?: any;
  remBaseline?: number;
  style?: any;
}

const propRemWrapperTypes = {
  children: PropTypes.any,
  remBaseline: PropTypes.number,
  style: [PropTypes.object, PropTypes.string],
};
const defaultRemWrapperProps = {};
export const vueRemWrapperPropsType = vuePropsMake(
  propRemWrapperTypes,
  defaultRemWrapperProps
);
const RemWrapper = defineComponent<RemWrapperProps>((props) => {
  const slots = useSlots();

  function translateTransformToRem(transform: any, remBaseline = 16) {
    const convertedValues = transform
      .replace("translate(", "")
      .replace(")", "")
      .split(",")
      .map((px: any) => px.replace("px", ""))
      .map((px: any) => parseInt(px, 10) / remBaseline)
      .map((x: any) => `${x}rem`);
    const [x, y] = convertedValues;

    return `translate(${x}, ${y})`;
  }

  return () => {
    const { children, remBaseline = 16, style } = props;
    const child = children;

    const editedStyle = {
      ...child.props.style,
      ...style,
      transform: translateTransformToRem(style.transform, remBaseline),
    };

    return cloneVNode(child, {
      ...child.props,
      ...omit(props, "children"),
      style: editedStyle,
    });
  };
});

RemWrapper.props = vueRemWrapperPropsType;
RemWrapper.name = "RemWrapper";

export { App as ExampleApp };
