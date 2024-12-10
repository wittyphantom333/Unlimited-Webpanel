<template>
  <div class="item">
    <div class="header q-px-sm q-mb-sm">
      <div class="slot" v-if="item.slot <= 5 && isPlayer">
        {{ item.slot }}
      </div>
      <div class="info">
        {{ item.amount }} ({{ (item.amount * item.weight) / 1000 }})
      </div>
    </div>
    <div class="icon q-pa-xs">
      <q-img
        class="image"
        fit="contain"
        :src="`${externalHosting.backend}/public/inventory/icons/${item.image}`"
        spinner-color="primary"
      />
    </div>
    <div class="caption q-px-xs">{{ item.label }}</div>
  </div>
</template>

<script>
import { externalHosting } from '../../../common/externalHosting'

export default {
  name: 'Item',
  props: {
    item: {},
    isPlayer: {
      default: false,
    },
  },
  data() {
    return {
      externalHosting,
    }
  },
}
</script>

<style scoped></style>
