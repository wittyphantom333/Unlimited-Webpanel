<template>
  <div class="row">
    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width row">
          <q-card-section class="col-12">
            <div class="text-h6">
              {{ $t(`components.devVehicleCreate.new`) }}:
            </div>
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-form ref="vehDefaults">
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                v-model="vehicle.model"
                @change="
                  val => {
                    vehicle.model = val.toLowerCase()
                  }
                "
                lazy-rules
                :rules="[
                  val => (val && val.length > 0) || $t('rules.required'),
                  val => (val && !/\s/.test(val)) || $t('rules.noSpace'),
                ]"
                :label="$t(`components.devVehicle.model`)"
              />
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                disable
                class="q-mt-md"
                v-model="vehicle.model"
                :label="$t(`components.devVehicle.hash`)"
              />
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                class="q-mt-md"
                v-model="vehicle.name"
                :label="$t(`components.devVehicle.name`)"
              />
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                class="q-mt-md"
                v-model="vehicle.brand"
                :label="$t(`components.devVehicle.brand`)"
              />
            </q-form>
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-form ref="vehShop">
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                v-model="vehicle.category"
                :label="$t(`components.devVehicle.category`)"
              />
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                class="q-mt-md"
                v-model="vehicle.categoryLabel"
                :label="$t(`components.devVehicle.categoryLabel`)"
              />
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                class="q-mt-md"
                v-model.number="vehicle.price"
                type="number"
                :label="$t(`components.devVehicle.price`)"
              />
              <q-select
                ref="accept"
                :label="$t('components.devVehicle.shop')"
                color="primary"
                label-color="primary"
                filled
                multiple
                v-model="vehicle.shop"
                popup-content-class="bg-secondary text-main"
                use-input
                use-chips
                hide-dropdown-icon
                input-debounce="0"
                new-value-mode="add-unique"
                input-class="text-main"
                class="q-mt-md"
              >
              </q-select>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width row">
          <q-card-section class="col-12">
            <div class="row">
              <div>
                <div class="text-h6">
                  {{ $t('components.devVehicle.customVariables') }}
                </div>
                <div class="text-caption text-sub">
                  {{ $t('components.devVehicle.customVarSub') }}
                </div>
              </div>
              <div class="q-ml-auto">
                <q-btn
                  text-color="main"
                  color="primary"
                  :label="$t('components.devVehicle.addCustomVar')"
                  @click="addCustomVar"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-section class="col-12">
            <q-form ref="customVarForm">
              <q-markup-table
                class="bg-secondary text-main"
                flat
                square
                separator="none"
              >
                <tbody>
                  <tr
                    v-for="(cVar, index) in customVars"
                    :key="`${index}-customVar`"
                  >
                    <td>
                      <q-input
                        label-color="primary"
                        :input-style="{ color: 'var(--q-main)' }"
                        filled
                        v-model="cVar.name"
                        :label="$t(`components.devVehicle.customVarName`)"
                        lazy-rules
                        :rules="[
                          val =>
                            (val && val.length > 0) || $t('rules.required'),
                          val =>
                            (val && !/\s/.test(val)) || $t('rules.noSpace'),
                          val =>
                            (val &&
                              customVars.filter(v => v.name === val).length <=
                                1) ||
                            $t('rules.unique'),
                          val =>
                            (val && !defaults.includes(val.toLowerCase())) ||
                            $t('rules.defaults'),
                        ]"
                      />
                    </td>
                    <td>
                      <q-input
                        label-color="primary"
                        :input-style="{ color: 'var(--q-main)' }"
                        filled
                        class="q-field--with-bottom"
                        v-model="cVar.value"
                        :label="$t(`components.devVehicle.customVarValue`)"
                      />
                    </td>
                    <td style="width: 30px" class="text-right vertical-middle">
                      <q-btn
                        text-color="main"
                        class="text-red-6"
                        dense
                        flat
                        icon="fas fa-trash"
                        size="xs"
                        @click="removeVar(cVar)"
                      >
                        <q-tooltip>
                          {{ $t('general.delete') }}
                        </q-tooltip>
                      </q-btn>
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-form>
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
          @click="trySave"
          :label="$t('general.create')"
          class="q-mr-sm"
        />
      </div>
    </div>
  </div>
</template>

<script>
import BasicDialog from '@/components/BasicDialog.vue'

export default {
  name: 'VehicleCreate',
  data() {
    return {
      defaults: [
        'name',
        'brand',
        'model',
        'price',
        'category',
        'categorylabel',
        'hash',
        'shop',
      ],
      pendingSave: false,
      vehicle: {
        name: '',
        brand: '',
        model: '',
        price: 0,
        category: '',
        categoryLabel: '',
        hash: '',
        shop: [],
      },
      customVars: [],
    }
  },
  methods: {
    isNumeric(str) {
      if (typeof str != 'string') return false
      return !isNaN(str) && !isNaN(parseFloat(str))
    },
    isBoolean(str) {
      return str === 'true' || (str === 'false' ? false : str)
    },
    addCustomVar() {
      this.customVars.push({ name: '', value: '' })
    },
    removeVar(row) {
      const index = this.customVars.indexOf(row)

      if (index > -1)
        this.$q
          .dialog({
            component: BasicDialog,
            componentProps: {
              title: this.$i18n.t('components.devVehicle.deleteHeader'),
              message: this.$i18n.t(
                'components.devVehicle.deleteCustomVarMsg',
                {
                  name: row.name,
                }
              ),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(() => {
            this.customVars.splice(index, 1)
          })
    },
    trySave() {
      this.$refs.vehDefaults.validate().then(success => {
        if (!success) {
          this.$q.notify({
            message: this.$i18n.t('general.error'),
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(
              `components.devVehicle.msg.error.missingFields`
            ),
          })

          return
        }

        this.$refs.customVarForm.validate().then(unique => {
          if (!unique) {
            this.$q.notify({
              message: this.$i18n.t('general.error'),
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
              caption: this.$i18n.t(
                `components.devVehicle.msg.error.uniqueVars`
              ),
            })

            return
          }

          this.customVars.forEach(customVar => {
            if (!customVar.name) return
            this.vehicle[customVar.name] = this.isNumeric(customVar.value)
              ? Number(customVar.value)
              : this.isBoolean(customVar.value)
          })

          this.pendingSave = true

          this.$axios
            .post(`/api/dev-vehicles/create`, this.vehicle)
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
                    `components.devVehicle.msg.error.${resMsg}`,
                    {
                      name: this.vehicle.model,
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
              this.$router.push({ name: 'dev-vehicle-list' })
            })
            .catch(() => {})
        })
      })
    },
  },
}
</script>

<style scoped></style>
