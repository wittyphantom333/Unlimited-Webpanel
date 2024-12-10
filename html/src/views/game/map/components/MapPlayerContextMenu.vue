<template>
  <q-card
    class="context-menu"
    style="background: var(--q-dark)"
    :style="style"
    v-click-outside="onClickOutside"
  >
    <q-list separator>
      <q-item class="text-main bg-primary" style="min-height: 0">
        {{ player.name }}
      </q-item>
      <q-item
        v-if="can(ACTION.GAME.PLAYER.READ, RESOURCE.GAME)"
        clickable
        v-ripple
        class="q-pa-sm"
        style="min-height: 0"
        :to="{
          name: 'game-player-detail',
          params: { citizenid: player.citizenid },
        }"
        @click="closeDialog(null)"
      >
        {{ $t('components.liveMap.viewPlayerTab') }}
      </q-item>
      <q-item
        clickable
        v-ripple
        class="q-pa-sm"
        style="min-height: 0"
        v-if="can(ACTION.GAME.PLAYER.KICK, RESOURCE.GAME)"
        @click="tryPlayerKick"
      >
        {{ $t('general.kick') }}
      </q-item>
      <q-item
        clickable
        v-ripple
        class="q-pa-sm"
        style="min-height: 0"
        v-if="can(ACTION.GAME.PLAYER.BAN, RESOURCE.GAME)"
        @click="tryPlayerBan"
      >
        {{ $t('general.ban') }}
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
import { ACTION, RESOURCE } from '../../../../../../common/permissions'
import { can } from '@core/layouts/utils'
import { closeDialog } from '@core/extensions/dialog'
import BasicInput from '@/components/BasicInput.vue'
import PlayerBan from '@/components/PlayerBan.vue'
import vClickOutside from 'click-outside-vue3'

export default {
  name: 'MapPlayerContextMenu',
  directives: {
    clickOutside: vClickOutside.directive,
  },
  props: {
    player: {
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
    tryPlayerKick() {
      this.closeDialog(null)

      this.$q
        .dialog({
          component: BasicInput,
          componentProps: {
            title: this.$i18n.t('general.kickHeader'),
            message: this.$i18n.t('general.kickMsg', {
              name: this.player.name,
            }),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(res => {
          this.$axios
            .post('/api/players/kick', {
              source: this.player.source,
              reason: res.input,
            })
            .then(r => {
              const resCode = r.data.resCode

              if (!resCode) {
                this.$q.notify({
                  message: 'Error',
                  position: 'top',
                  color: 'red',
                  icon: 'fas fa-exclamation-triangle',
                  caption: this.$i18n.t(
                    'components.player.msg.error.notOnline'
                  ),
                })
                return
              }

              this.$q.notify({
                message: this.$i18n.t('general.success'),
                position: 'top',
                color: 'green',
                icon: 'fas fa-check',
                caption: this.$i18n.t('general.kickSuccess'),
              })
            })
        })
    },
    tryPlayerBan() {
      this.closeDialog(null)

      this.$q
        .dialog({
          component: PlayerBan,
          componentProps: {
            title: this.$i18n.t('general.banHeader'),
            message: this.$i18n.t('general.banMsg', {
              name: this.player.name,
            }),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(res => {
          this.$axios
            .post('/api/players/ban', {
              citizenid: this.player.citizenid,
              reason: res.input,
              time: res.time,
              hwid: res.hwid,
            })
            .then(r => {
              const resCode = r.data.resCode

              if (!resCode) {
                this.$q.notify({
                  message: 'Error',
                  position: 'top',
                  color: 'red',
                  icon: 'fas fa-exclamation-triangle',
                  caption: this.$i18n.t(
                    'components.player.msg.error.notOnline'
                  ),
                })
                return
              }

              this.$q.notify({
                message: this.$i18n.t('general.success'),
                position: 'top',
                color: 'green',
                icon: 'fas fa-check',
                caption: this.$i18n.t('general.banSuccess'),
              })
            })
        })
    },
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
