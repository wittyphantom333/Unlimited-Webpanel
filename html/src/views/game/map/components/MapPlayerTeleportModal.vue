<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin bg-secondary text-main">
      <q-card-section class="row">
        <div class="text-body2">
          {{ $t('components.liveMap.teleportPlayerHeader') }}
        </div>
        <q-icon
          class="q-ml-auto cursor-pointer"
          name="close"
          @click.stop="hide"
        ></q-icon>
      </q-card-section>
      <q-card-section class="row justify-center">
        <q-input
          dense
          label-color="primary"
          :input-style="{ color: 'var(--q-main)' }"
          filled
          v-model="curCoords.x"
          label="x"
          disable
          class="col-12 q-ma-xs"
        />
        <q-input
          dense
          label-color="primary"
          :input-style="{ color: 'var(--q-main)' }"
          filled
          v-model="curCoords.y"
          label="y"
          disable
          class="col-12 q-ma-xs"
        />
        <q-input
          dense
          label-color="primary"
          :input-style="{ color: 'var(--q-main)' }"
          filled
          v-model="curCoords.z"
          label="z"
          disable
          class="col-12 q-ma-xs"
        />
        <q-btn
          v-if="can(ACTION.GAME.WAYPOINT.READ, RESOURCE.GAME)"
          text-color="main"
          color="primary"
          :label="$t('components.liveMap.btn.loadFromWaypoint')"
          icon="push_pin"
          class="q-ma-xs"
          size="sm"
          @click="openWaypointsModal"
        />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-select
          :label="$t('components.liveMap.labels.selectedPlayer')"
          color="primary"
          label-color="primary"
          v-model="selectedPlayer"
          :options="players"
          :popup-content-style="{ backgroundColor: 'var(--q-secondary)' }"
        >
          <template v-slot:selected>
            <div class="text-main">
              {{ selectedPlayer ? `${selectedPlayer.name}` : '' }}
            </div>
          </template>

          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label class="text-main"
                  >{{ scope.opt.name }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn
          text-color="main"
          color="primary"
          :label="$t('general.teleport')"
          :disable="!selectedPlayer"
          @click="onOKClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { can } from '@core/layouts/utils'
import { ACTION, RESOURCE } from '../../../../../../common/permissions'
import WaypointsModal from '@/components/WaypointsModal.vue'

export default {
  name: 'MapPlayerTeleportModal',
  props: {
    coords: {
      type: Object,
    },
    players: {
      type: Array,
    },
  },
  data() {
    return {
      RESOURCE,
      ACTION,
      selectedPlayer: null,
      curCoords: null,
    }
  },
  emits: ['ok', 'hide'],
  methods: {
    can,
    show() {
      this.$refs.dialog.show()
    },
    hide() {
      this.$refs.dialog.hide()
    },
    onDialogHide() {
      this.$emit('hide')
    },
    onOKClick() {
      this.$axios
        .post(`/api/players/teleport`, {
          citizenid: this.selectedPlayer.citizenid,
          coords: this.curCoords,
        })
        .then(r => {
          const resCode = r.data.resCode

          if (!resCode) {
            this.$q.notify({
              message: 'Error',
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
              caption: this.$i18n.t('components.player.msg.error.notOnline'),
            })
            return
          }

          this.$q.notify({
            message: this.$i18n.t('general.success'),
            position: 'top',
            color: 'green',
            icon: 'fas fa-check',
            caption: this.$i18n.t(`general.teleported`),
          })
        })
        .finally(() => {
          this.hide()
        })
    },
    onCancelClick() {
      this.hide()
    },
    openWaypointsModal() {
      this.$q
        .dialog({
          component: WaypointsModal,
          componentProps: {
            title: this.$i18n.t('components.waypoint.modalHeader'),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(res => {
          if (res.coords) {
            this.curCoords = res.coords
          }
        })
    },
  },
  created() {
    this.curCoords = this.coords
  },
}
</script>
