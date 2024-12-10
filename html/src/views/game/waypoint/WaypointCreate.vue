<template>
  <div class="row">
    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width">
          <q-form ref="waypointForm" class="row">
            <q-card-section class="col-12 col-md-6">
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                v-model="waypoint.name"
                :label="$t(`components.waypoint.labels.name`)"
                lazy-rules
                :rules="[
                  val => (val && val.length > 0) || $t('rules.required'),
                  val => (val && !/\s/.test(val)) || $t('rules.noSpace'),
                ]"
              />
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
          </q-form>
        </q-card>
      </div>
    </div>
    <div class="col-12">
      <div class="q-ma-sm row justify-end">
        <q-btn
          text-color="main"
          :loading="pendingSave"
          color="primary"
          @click="trySave"
          :label="$t('general.create')"
          class="q-mr-sm"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WaypointCreate',
  data() {
    return {
      pendingSave: false,
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
          .post(`/api/waypoints/create`, this.waypoint)
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
  },
  mounted() {
    if (this.$route.query.coords) {
      const coords = Object.fromEntries(new URLSearchParams(this.$route.query.coords))
      this.waypoint.coords = coords
    }
  },
}
</script>

<style scoped></style>
