<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin bg-secondary text-main">
      <q-card-section class="row">
        <div class="text-body2" v-html="title"></div>
        <q-icon
          class="q-ml-auto cursor-pointer"
          name="close"
          @click.stop="hide"
        ></q-icon>
      </q-card-section>
      <q-card-section>
        <q-select
          :label="$t('components.waypoint.labels.label')"
          color="primary"
          label-color="primary"
          v-model="waypoint"
          :options="waypoints"
          :popup-content-style="{ backgroundColor: 'var(--q-secondary)' }"
        >
          <template v-slot:selected>
            <div class="text-main">
              {{ waypoint.label }}
            </div>
          </template>

          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label class="text-main">{{
                  scope.opt.label
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn
          text-color="main"
          color="primary"
          :label="$t('general.ok')"
          @click="onOKClick"
          :disable="!waypoint.name"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'WaypointsModal',
  data() {
    return {
      waypoint: { name: null, label: '', coords: { x: 0, y: 0, z: 0 } },
      waypoints: null,
    }
  },
  props: {
    title: String,
  },
  emits: ['ok', 'hide'],
  methods: {
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
      this.$emit('ok', { coords: this.waypoint.coords })
      this.hide()
    },
    onCancelClick() {
      this.hide()
    },
  },
  async mounted() {
    await this.$axios
      .get(`/api/waypoints`)
      .then(r => {
        const waypoints = r.data.waypoints

        if (waypoints.length === 0) {
          this.$q.notify({
            message: 'Error',
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t('components.waypoint.msg.error.no_waypoints'),
          })
          return
        }

        this.waypoints = waypoints
      })
      .catch(() => {
        this.$q.notify({
          message: 'Error',
          position: 'top',
          color: 'red',
          icon: 'fas fa-exclamation-triangle',
          caption: this.$i18n.t(
            'components.waypoint.msg.error.failedFetchWaypoints'
          ),
        })
        this.hide()
      })
  },
}
</script>

<style scoped></style>
