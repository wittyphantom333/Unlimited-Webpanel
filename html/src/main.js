import '@core/styles/theme.scss'

import { createApp } from 'vue'
import App from './App.vue'
import VueSocketIO from '@libs/socket'

import { externalHosting } from '../../common/externalHosting'

// Plugins
import router from './router'
import axios from '@axios'
import i18n from '@libs/i18n'
import { abilitiesPlugin } from '@casl/vue'
import ability from '@libs/acl/ability'
import pinia from '@stores/store'
import { Quasar, Notify, Dialog } from 'quasar'

// Import icon libraries
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// create App
const app = createApp(App)

app.use(Quasar, {
  plugins: { Notify, Dialog }, // import Quasar plugins and add here
  config: {
    notify: {
      /* look at QuasarConfOptions from the API card */
    },
  },
})

app.use(
  new VueSocketIO({
    debug: false,
    connection: externalHosting.backend ? `${externalHosting.backend}` : `/`,
    options: {
      autoConnect: false,
      path: externalHosting.socketPath,
    },
  })
)
app.use(pinia)
app.use(i18n)
app.use(abilitiesPlugin, ability, {
  useGlobalProperties: true,
})

app.config.globalProperties.$axios = axios

app.use(router).mount('#app')
