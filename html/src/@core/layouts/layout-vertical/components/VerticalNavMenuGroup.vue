<template>
  <q-expansion-item
    class="text-main"
    v-if="canViewVerticalNavMenuGroup(item)"
    :icon="item.icon"
    :label="$t(`navigation.titles.${item.title}`)"
  >
    <component
      :is="resolveNavItemComponent(child)"
      v-for="child in item.children"
      :key="child.header || child.title"
      :item="child"
    />
  </q-expansion-item>
</template>

<script>
import { canViewVerticalNavMenuGroup } from '../../utils'

import VerticalNavMenuLink from './VerticalNavMenuLink.vue'
import VerticalNavMenuHeader from './VerticalNavMenuHeader.vue'

import { resolveVerticalNavMenuItemComponent as resolveNavItemComponent } from '../../utils'

export default {
  name: 'VerticalNavMenuGroup',
  components: {
    VerticalNavMenuLink,
    VerticalNavMenuHeader,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    resolveNavItemComponent,
    canViewVerticalNavMenuGroup,
  },
}
</script>

<style scoped lang="scss">
.v-list-group__items .v-list-item {
  padding: 12px !important;
}
</style>
