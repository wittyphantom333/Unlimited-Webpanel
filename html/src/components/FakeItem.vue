<template>
  <div class="item">
    <div class="header q-px-sm q-mb-sm">
      <div class="slot" v-if="slotNumber <= 5">
        {{ slotNumber }}
      </div>
      <div class="info" />
    </div>
    <div class="icon q-pa-xs">
      <div class="image"></div>
    </div>
    <div class="caption q-px-xs" />
  </div>
</template>

<script>
export default {
  name: "FakeItem",
  props: {
    slotNumber: Number
  }
}
</script>