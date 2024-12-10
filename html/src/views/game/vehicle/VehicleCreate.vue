<template>
  <div class="row">
    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width row">
          <q-card-section class="col-12">
            <div class="text-h6">{{ $t(`components.vehicleCreate.new`) }}:</div>
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-form ref="vehicleCreate">
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                v-model="citizenid"
                :label="$t(`components.vehicle.labels.citizenid`)"
              />
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                class="q-mt-md"
                v-model="vehicle.model"
                :label="$t(`components.vehicle.labels.model`)"
                lazy-rules
                :rules="[
                  val => (val && val.length > 0) || $t('rules.required'),
                ]"
              />
              <q-input
                class="q-mt-md"
                dense
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                maxlength="8"
                v-model="vehicle.plate"
                :label="$t(`components.vehicle.labels.plate`)"
                lazy-rules
                :rules="[
                  val =>
                    (val && /^[a-zA-Z0-9 ]+$/.test(val)) ||
                    $t('rules.onlyCharsNumbers'),
                ]"
              />
            </q-form>
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              v-model="vehicle.garage"
              :label="$t(`components.vehicle.labels.garage`)"
            />
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              class="q-mt-md"
              type="number"
              v-model.number="vehicle.state"
              :label="$t(`components.vehicle.labels.state`)"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="col-12">
      <div class="q-ma-sm row justify-end">
        <q-btn
          text-color="main"
          :loading="pendingSave"
          color="primary"
          @click="tryCreateVehicle"
          :label="$t('general.create')"
          class="q-mr-sm"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VehicleCreate',
  data() {
    return {
      pendingSave: false,
      citizenid: null,
      vehicle: {},
    }
  },
  methods: {
    tryCreateVehicle() {
      this.$refs.vehicleCreate.validate().then(allowed => {
        if (!allowed) return

        this.pendingSave = true

        this.$axios
          .post(`/api/vehicles/create`, {
            citizenid: this.citizenid,
            vehicle: this.vehicle,
          })
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
                caption: this.$i18n.t(`components.vehicle.msg.error.${resMsg}`),
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
            this.$router.push({ name: 'game-vehicle-list' })
          })
          .catch(e => {})
      })
    },
  },
  mounted() {
    this.citizenid = this.$route.query.citizenid || ''
  },
}
</script>

<style scoped></style>
