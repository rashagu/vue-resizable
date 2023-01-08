import type { VNode } from "vue";
import { cloneVNode } from "vue";

// React.addons.cloneWithProps look-alike that merges style & className.
export function cloneElement(element: VNode, props: any): VNode {
  if (props.style && element.props && element.props.style) {
    props.style = { ...element.props.style, ...props.style };
  }
  if (props.class && element.props && element.props.class) {
    props.class = `${element.props.class} ${props.class}`;
  }
  return cloneVNode(element, props);
}
