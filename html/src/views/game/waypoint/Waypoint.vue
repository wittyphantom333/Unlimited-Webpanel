<template>
  <div class="row">
    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width">
          <q-form ref="waypointForm" class="row">
            <q-card-section class="col-12">
              <div class="text-h6">
                {{ $t(`components.waypoint.edit`) }}:
                <span class="text-primary">{{ waypoint.name }}</span>
              </div>
            </q-card-section>
            <q-card-section class="col-12 col-md-6">
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                v-model="waypoint.label"
                :label="$t(`components.waypoint.labels.label`)"
                lazy-rules
                :rules="[val => (val && true) || $t('rules.required')]"
              />
            </q-card-section>
            <div class="col-12 row">
              <q-card-section class="col-12 col-md-4">
                <q-input
                  label-color="primary"
                  :input-style="{ color: 'var(--q-main)' }"
                  filled
                  type="number"
                  v-model="waypoint.coords.x"
                  label="x"
                  lazy-rules
                  mask="#.#"
                  :rules="[
                    val => (val !== null && val !== '') || $t('rules.required'),
                  ]"
                />
              </q-card-section>
              <q-card-section class="col-12 col-md-4">
                <q-input
                  label-color="primary"
                  :input-style="{ color: 'var(--q-main)' }"
                  filled
                  type="number"
                  v-model="waypoint.coords.y"
                  label="y"
                  lazy-rules
                  mask="#.#"
                  :rules="[
                    val => (val !== null && val !== '') || $t('rules.required'),
                  ]"
                />
              </q-card-section>
              <q-card-section class="col-12 col-md-4">
                <q-input
                  label-color="primary"
                  :input-style="{ color: 'var(--q-main)' }"
                  filled
                  type="number"
                  v-model="waypoint.coords.z"
                  label="z"
                  lazy-rules
                  mask="#.#"
                  :rules="[
                    val => (val !== null && val !== '') || $t('rules.required'),
                  ]"
                />
              </q-card-section>
            </div>
          </q-form>
        </q-card>
      </div>
    </div>
    <div class="col-12">
      <div class="q-ma-sm row justify-end">
        <q-btn
          text-color="main"
          :disable="pendingDelete || pendingSave"
          color="primary"
          @click="$router.push({ name: 'game-waypoint-list' })"
          :label="$t('general.back')"
          class="q-mr-auto"
        />
        <q-btn
          text-color="main"
          v-if="can(ACTION.GAME.WAYPOINT.MODIFY, RESOURCE.GAME)"
          :loading="pendingSave"
          :disable="pendingDelete"
          color="primary"
          @click="trySave"
          :label="$t('general.save')"
          class="q-mr-sm"
        />
        <q-btn
          text-color="main"
          v-if="can(ACTION.GAME.WAYPOINT.DELETE, RESOURCE.GAME)"
          :loading="pendingDelete"
          :disable="pendingSave"
          color="negative"
          @click="tryDelete"
          :label="$t('general.delete')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ACTION, RESOURCE } from '../../../../../common/permissions'
import { can } from '@core/layouts/utils'
import BasicDialog from '@/components/BasicDialog.vue'

export default {
  name: 'Waypoint',
  data() {
    return {
      RESOURCE,
      ACTION,
      pendingSave: false,
      pendingDelete: false,
      waypoint: {
        name: '',
        label: '',
        coords: {
          x: 0.0,
          y: 0.0,
          z: 0.0,
        },
      },
    }
  },
  methods: {
    can,
    trySave() {
      this.$refs.waypointForm.validate().then(success => {
        if (!success) {
          this.$q.notify({
            message: this.$i18n.t('general.error'),
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(
              `components.waypoint.msg.error.missingFields`,
              {
                name: this.waypoint.name,
              }
            ),
          })

          return
        }

        this.pendingSave = true
        this.$axios
          .patch(`/api/waypoints/save/${this.waypoint.name}`, this.waypoint)
          .then(r => {
            this.pendingSave = false
            const resCode = r.data.resCode

            if (!resCode) {
              const resMsg = r.data.resMsg
              this.$q.notify({
                message: this.$i18n.t('general.error'),
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t(
                  `components.waypoint.msg.error.${resMsg}`,
                  {
                    name: this.waypoint.name,
                  }
                ),
              })
              return
            }

            this.$q.notify({
              message: this.$i18n.t('general.success'),
              position: 'top',
              color: 'green',
              icon: 'fas fa-check',
              caption: this.$i18n.t('general.saved'),
            })
            this.$router.push({ name: 'game-waypoint-list' })
          })
          .catch(e => {
            console.error(e)
          })
      })
    },
    tryDelete() {
      this.pendingDelete = true

      this.$q
        .dialog({
          component: BasicDialog,
          componentProps: {
            title: this.$i18n.t('components.waypoint.deleteHeader'),
            message: this.$i18n.t('components.waypoint.deleteMsg', {
              name: this.waypoint.name,
            }),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.$axios
            .delete(`/api/waypoints/delete/${this.waypoint.name}`)
            .then(r => {
              this.pendingDelete = false
              const resCode = r.data.resCode

              if (!resCode) {
                const resMsg = r.data.resMsg
                this.$q.notify({
                  message: this.$i18n.t('general.error'),
                  position: 'top',
                  color: 'red',
                  icon: 'fas fa-exclamation-triangle',
                  caption: this.$i18n.t(
                    `components.waypoint.msg.error.${resMsg}`,
                    {
                      name: this.waypoint.name,
                    }
                  ),
                })
                return
              }

              this.$q.notify({
                message: this.$i18n.t('general.success'),
                position: 'top',
                color: 'green',
                icon: 'fas fa-check',
                caption: this.$i18n.t('general.deleted'),
              })
              this.$router.push({ name: 'game-waypoint-list' })
            })
            .catch(e => {})
        })
        .onCancel(() => {
          this.pendingDelete = false
        })
    },
  },
  mounted() {
    this.$axios
      .get(`/api/waypoints/${this.$route.params.waypointId}`)
      .then(r => {
        const waypoint = r.data.waypoint

        if (!waypoint) {
          this.$q.notify({
            message: r.data.msg,
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: 'Error',
          })
          return
        }

        this.waypoint = waypoint
      })
  },
}
</script>

<style scoped></style>
