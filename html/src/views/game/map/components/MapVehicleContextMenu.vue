<template>
  <q-card
    class="context-menu"
    style="background: var(--q-dark)"
    :style="style"
    v-click-outside="onClickOutside"
  >
    <q-list separator>
      <q-item class="text-main bg-primary" style="min-height: 0">
        {{ vehicle.plate }}
      </q-item>
      <q-item
        v-if="can(ACTION.GAME.VEHICLE.READ, RESOURCE.GAME)"
        clickable
        v-ripple
        class="q-pa-sm"
        style="min-height: 0"
        :to="{
          name: 'game-vehicle-detail',
          params: { vehicleId: vehicle.id },
        }"
        @click="closeDialog(null)"
      >
        {{ $t('components.liveMap.viewVehicleTab') }}
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
import { ACTION, RESOURCE } from '../../../../../../common/permissions'
import vClickOutside from 'click-outside-vue3'
import { can } from '@core/layouts/utils'
import { closeDialog } from '@core/extensions/dialog'

export default {
  name: 'MapVehicleContextMenu',
  directives: {
    clickOutside: vClickOutside.directive,
  },
  props: {
    vehicle: {
      type: Object,
    },
    evt: {
      Object,
    },
  },
  data() {
    return {
      RESOURCE,
      ACTION,
      left: 0,
      top: 0,
    }
  },
  computed: {
    style() {
      return {
        top: this.top + 'px',
        left: this.left + 'px',
      }
    },
  },
  methods: {
    can,
    closeDialog,
    onClickOutside() {
      this.closeDialog(null)
    },
  },
  created() {
    this.left = this.evt.pageX || this.evt.clientX
    this.top = this.evt.pageY || this.evt.clientY

    this.$nextTick(() => this.$el.focus())
  },
}
</script>

<style scoped>
.context-menu {
  position: absolute;
  z-index: 999;
  overflow: hidden;
}
</style>
