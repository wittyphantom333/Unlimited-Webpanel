<template>
  <q-item
    v-if="canViewVerticalNavMenuLink(item)"
    clickable
    v-ripple
    :to="{ name: item.route }"
    :active="$route.matched.some(route => route.name === item.route)"
    active-class="active-sidebar-element"
  >
    <q-item-section avatar>
      <q-icon
        :color="
          $route.matched.some(route => route.name === item.route)
            ? 'primary'
            : 'main'
        "
        size="sm"
        :name="item.icon || 'mdi-adjust'"
      />
    </q-item-section>

    <q-item-section
      :class="{
        'text-main': $route.matched.some(route => route.name !== item.route),
      }"
      v-text="$t(`navigation.titles.${item.title}`)"
    ></q-item-section>
  </q-item>
</template>

<script>
import { canViewVerticalNavMenuLink } from '../../utils'

export default {
  name: 'VerticalNavMenuLink',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    canViewVerticalNavMenuLink,
  },
}
</script>

<style scoped lang="scss">
.active-sidebar-element {
  background: rgba(var(--q-primary), 0.15);
}
</style>
