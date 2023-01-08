import { defineComponent, ref, h, Fragment, useSlots } from "vue";
import {Example} from "@/examples/example";

interface AppProps {
  name?: string;
}

export const vuePropsType = {
  name: String,
};
const App = defineComponent<AppProps>((props) => {
  const slots = useSlots();

  return () => <div>
    <Example />
  </div>;
});

App.props = vuePropsType;
App.name = "App";

export default App;
