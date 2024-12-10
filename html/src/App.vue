<template>
  <component v-if="!loading" :is="layout">
    <router-view v-slot="{ Component, route }">
      <transition name="scale" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </component>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { mapActions } from 'pinia'
import { useAppStore } from '@stores/app'
import { setCssVar } from 'quasar'

const LayoutFull = defineAsyncComponent(() =>
  import('@core/layouts/layout-full/LayoutFull')
)
const LayoutVertical = defineAsyncComponent(() =>
  import('@core/layouts/layout-vertical/LayoutVertical')
)

export default {
  name: 'App',
  components: { LayoutFull, LayoutVertical },
  data() {
    return {
      loading: true,
    }
  },
  computed: {
    layout() {
      if (this.$route.meta.layout === 'full') return 'layout-full'

      return `layout-vertical`
    },
  },
  methods: {
    ...mapActions(useAppStore, ['UPDATE_SETUP_MODE']),
  },
  async beforeCreate() {
    await this.$axios
      .get('/init')
      .then(r => {
        this.loading = false

        if (r.data.setup) {
          this.UPDATE_SETUP_MODE(true)
          this.$router.push({ name: 'setup' })
          return
        }

        if (r.data.appData.colors) {
          for (const [key, color] of Object.entries(r.data.appData.colors)) {
            setCssVar(key, color.value)
          }
        }

        this.$i18n.locale = r.data.appData.lang
      })
      .catch(e => {
        this.$router.push({ name: 'auth-login' })
        this.loading = false
      })

    this.$socket.connect()
  },
}
</script>

<style>
html {
  background: var(--q-dark);
}
#app {
  font-family: 'Montserrat', Helvetica, Arial, serif;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.5s ease;
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

[v-cloak] {
  display: none;
}
</style>
