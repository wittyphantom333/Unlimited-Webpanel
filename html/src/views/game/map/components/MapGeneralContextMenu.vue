<template>
  <q-card
    class="context-menu"
    style="background: var(--q-dark)"
    :style="style"
    v-click-outside="onClickOutside"
  >
    <q-list separator>
      <q-item class="text-main bg-primary" style="min-height: 0">
        {{ $t('components.liveMap.generalContextMenuHeader') }}
      </q-item>
      <q-item clickable v-ripple class="q-pa-sm" @click="copyCoordsToClipboard">
        {{ $t('components.liveMap.copyCoordsToClipboard') }}
      </q-item>
      <q-item
        v-if="can(ACTION.GAME.PLAYER.POSITION, RESOURCE.GAME)"
        clickable
        v-ripple
        class="q-pa-sm"
        @click="openTeleportHere"
      >
        {{ $t('components.liveMap.teleportTo') }}
      </q-item>
      <q-item
        clickable
        v-ripple
        class="q-pa-sm"
        style="min-height: 0"
        v-if="can(ACTION.GAME.WAYPOINT.MODIFY, RESOURCE.GAME)"
        @click="createWaypoint"
      >
        {{ $t('components.liveMap.createWaypoint') }}
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
import vClickOutside from 'click-outside-vue3'
import { ACTION, RESOURCE } from '../../../../../../common/permissions'
import { can } from '@core/layouts/utils'
import { closeDialog } from '@core/extensions/dialog'
import MapPlayerTeleportModal from '@/views/game/map/components/MapPlayerTeleportModal.vue'
import { copyToClipboard } from 'quasar'

export default {
  name: 'MapGeneralContextMenu',
  directives: {
    clickOutside: vClickOutside.directive,
  },
  props: {
    coords: {
      type: Object,
    },
    players: {
      type: Array,
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
    openTeleportHere() {
      this.closeDialog(null)

      if (this.players.length === 0) {
        this.$q.notify({
          message: 'Error',
          position: 'top',
          color: 'red',
          icon: 'fas fa-exclamation-triangle',
          caption: this.$i18n.t('components.liveMap.msg.error.noPlayersOnline'),
        })
        return
      }

      this.$q.dialog({
        component: MapPlayerTeleportModal,
        componentProps: {
          players: this.players,
          coords: this.coords,
        },
        cancel: true,
        persistent: true,
      })
    },
    createWaypoint() {
      this.closeDialog(null)
      this.$router.push({
        name: 'game-waypoint-create',
        query: { coords: new URLSearchParams(this.coords).toString() },
      })
    },
    copyCoordsToClipboard() {
      copyToClipboard(
        Object.entries({
          x: this.coords.x,
          y: this.coords.y,
        })
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
      )
        .then(() => {
          this.$q.notify({
            message: this.$i18n.t('general.success'),
            position: 'top',
            color: 'green',
            icon: 'fas fa-check',
            caption: this.$i18n.t(
              `components.liveMap.msg.success.coordsCopied`
            ),
          })
        })
        .catch(() => {
          this.$q.notify({
            message: 'Error',
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(
              'components.liveMap.msg.error.errorCopyCoords'
            ),
          })
        })
        .finally(() => this.closeDialog(null))
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
