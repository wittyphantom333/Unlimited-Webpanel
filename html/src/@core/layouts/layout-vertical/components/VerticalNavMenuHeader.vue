<template>
  <q-item-label
    class="text-sub"
    header
    v-if="canViewVerticalNavMenuHeader(item)"
    >{{ $t(`navigation.header.${item.header}`) }}</q-item-label
  >
</template>

<script>
import { canViewVerticalNavMenuHeader } from '../../utils'

export default {
  name: 'VerticalNavMenuHeader',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    canViewVerticalNavMenuHeader,
  },
}
</script>

<style scoped></style>
