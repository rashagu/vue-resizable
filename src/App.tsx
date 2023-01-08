import {defineComponent, ref, h, Fragment, useSlots} from 'vue'

interface AppProps {
  name?: string
}

export const vuePropsType = {
  name: String
}
const App = defineComponent<AppProps>((props, {}) => {
  const slots = useSlots()


  return () => (
    <div>
      App
    </div>
  )
})

App.props = vuePropsType
App.name = 'App'

export default App

