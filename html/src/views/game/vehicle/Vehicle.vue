<template>
  <div class="row">
    <div class="col-12 q-pa-sm">
      <div class="row">
        <q-card class="bg-secondary row" style="width: 100%">
          <q-card-section class="q-pa-none">
            <div class="row">
              <q-btn
                v-if="can(ACTION.GAME.STASHES.READ, RESOURCE.GAME)"
                text-color="main"
                class="q-ma-md"
                color="primary"
                :label="$t('components.vehicle.buttons.openTrunk')"
                @click="
                  $router.push({
                    name: 'game-stashes-detail',
                    params: { stashId: vehicle.plate },
                    query: { type: 'Trunk' },
                  })
                "
              ></q-btn>
              <q-btn
                v-if="can(ACTION.GAME.STASHES.READ, RESOURCE.GAME)"
                text-color="main"
                class="q-ma-md"
                color="primary"
                :label="$t('components.vehicle.buttons.openGlovebox')"
                @click="
                  $router.push({
                    name: 'game-stashes-detail',
                    params: { stashId: vehicle.plate },
                    query: { type: 'Glovebox' },
                  })
                "
              ></q-btn>
              <q-btn
                v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)"
                text-color="main"
                class="q-ma-md"
                color="primary"
                :label="$t('components.vehicle.buttons.changeOwner')"
                @click="changeOwner"
              ></q-btn>
              <q-btn
                v-if="can(ACTION.GAME.VEHICLE.DESPAWN, RESOURCE.GAME)"
                text-color="main"
                class="q-ma-md"
                color="primary"
                :label="$t('components.vehicle.buttons.despawnVehicle')"
                @click="despawnehicle"
              ></q-btn>
              <q-btn
                v-if="can(ACTION.GAME.VEHICLE.REPAIR, RESOURCE.GAME)"
                text-color="main"
                class="q-ma-md"
                color="primary"
                :label="$t('components.vehicle.buttons.repairVehicle')"
                @click="repairVehicle"
              ></q-btn>
              <q-btn
                v-if="can(ACTION.GAME.VEHICLE.DELETE, RESOURCE.GAME)"
                text-color="main"
                class="q-ma-md"
                color="primary"
                :label="$t('components.vehicle.buttons.deleteVehicle')"
                @click="deleteVehicle"
              ></q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="col-12 col-md-6 q-pa-sm">
      <q-card class="bg-secondary col-12 col-md-6" style="height: 100%">
        <q-card-section class="col-12">
          <div class="text-h6">
            <span class="text-main">{{
              $t('components.vehicle.header.owner')
            }}</span>
          </div>
        </q-card-section>
        <q-card-section class="col-12">
          <q-markup-table
            class="bg-secondary text-main"
            flat
            square
            separator="none"
          >
            <tr v-if="vehicle.ownerName">
              <td class="text-left">
                {{ $t(`components.vehicle.labels.owner`) }}
              </td>
              <td class="text-left">
                {{ vehicle.ownerName }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.citizenid`) }}
              </td>
              <td
                class="text-left cursor-pointer text-primary"
                style="text-decoration: underline"
                v-if="can(ACTION.GAME.PLAYER.READ, RESOURCE.GAME)"
                @click="
                  $router.push({
                    name: 'game-player-detail',
                    params: { citizenid: vehicle.citizenid },
                  })
                "
              >
                {{ vehicle.citizenid }}
              </td>
              <td v-else class="text-left">
                {{ vehicle.citizenid }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.license`) }}
              </td>
              <td class="text-left">
                {{ vehicle.license }}
              </td>
            </tr>
          </q-markup-table>
        </q-card-section>
        <q-card-section class="col-12">
          <div class="text-h6">
            <span class="text-main">{{
              $t('components.vehicle.header.payment')
            }}</span>
          </div>
        </q-card-section>
        <q-card-section class="col-12">
          <q-markup-table
            class="bg-secondary text-main"
            flat
            square
            separator="none"
          >
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.depotprice`) }}
              </td>
              <template v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                    dense
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    type="number"
                    v-model="vehicle.depotprice"
                    :label="$t(`components.vehicle.labels.depotprice`)"
                  />
                </td>
                <td>
                  <q-btn
                    text-color="main"
                    class="q-ml-md"
                    color="primary"
                    style="max-height: 24px"
                    filled
                    @click="updateField('depotprice')"
                    :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ vehicle.depotprice }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.balance`) }}
              </td>
              <template v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                    dense
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    type="number"
                    v-model="vehicle.balance"
                    :label="$t(`components.vehicle.labels.balance`)"
                  />
                </td>
                <td>
                  <q-btn
                    text-color="main"
                    class="q-ml-md"
                    color="primary"
                    style="max-height: 24px"
                    filled
                    @click="updateField('balance')"
                    :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ vehicle.balance }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.paymentamount`) }}
              </td>
              <template v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                    dense
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    type="number"
                    v-model="vehicle.paymentamount"
                    :label="$t(`components.vehicle.labels.paymentamount`)"
                  />
                </td>
                <td>
                  <q-btn
                    text-color="main"
                    class="q-ml-md"
                    color="primary"
                    style="max-height: 24px"
                    @click="updateField('paymentamount')"
                    :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ vehicle.paymentamount }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.paymentsleft`) }}
              </td>
              <template v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                    dense
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    type="number"
                    v-model="vehicle.paymentsleft"
                    :label="$t(`components.vehicle.labels.paymentsleft`)"
                  />
                </td>
                <td>
                  <q-btn
                    text-color="main"
                    class="q-ml-md"
                    color="primary"
                    style="max-height: 24px"
                    @click="updateField('paymentsleft')"
                    :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ vehicle.paymentsleft }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.financetime`) }}
              </td>
              <template v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                    dense
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    type="number"
                    v-model="vehicle.financetime"
                    :label="$t(`components.vehicle.labels.financetime`)"
                  />
                </td>
                <td>
                  <q-btn
                    text-color="main"
                    class="q-ml-md"
                    color="primary"
                    style="max-height: 24px"
                    @click="updateField('financetime')"
                    :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ vehicle.financetime }}</td>
            </tr>
          </q-markup-table>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-md-6 q-pa-sm">
      <q-card class="bg-secondary col-12 col-md-6" style="height: 100%">
        <q-card-section class="col-12">
          <div class="text-h6">
            <span class="text-main">{{
              $t('components.vehicle.header.car')
            }}</span>
          </div>
        </q-card-section>
        <q-card-section class="col-12">
          <q-markup-table
            class="bg-secondary text-main"
            flat
            square
            separator="none"
          >
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.model`) }}
              </td>
              <td class="text-left">
                {{ vehicle.vehicle }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.plate`) }}
              </td>
              <template v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-form ref="plate">
                    <q-input
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
                </td>
                <td>
                  <q-btn
                    text-color="main"
                    class="q-ml-md"
                    color="primary"
                    style="max-height: 24px"
                    @click="updatePlate()"
                    :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ vehicle.plate }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.fakeplate`) }}
              </td>
              <td class="text-left">
                {{ vehicle.fakeplate }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.drivingdistance`) }}
              </td>
              <template v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                    dense
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    type="number"
                    v-model="vehicle.drivingdistance"
                    :label="$t(`components.vehicle.labels.drivingdistance`)"
                  />
                </td>
                <td>
                  <q-btn
                    text-color="main"
                    class="q-ml-md"
                    color="primary"
                    style="max-height: 24px"
                    @click="updateField('drivingdistance')"
                    :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ vehicle.drivingdistance }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.garage`) }}
              </td>
              <template v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                    dense
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    v-model="vehicle.garage"
                    :label="$t(`components.vehicle.labels.garage`)"
                  />
                </td>
                <td>
                  <q-btn
                    text-color="main"
                    class="q-ml-md"
                    color="primary"
                    style="max-height: 24px"
                    @click="updateField('garage')"
                    :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ vehicle.garage }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.state`) }}
              </td>
              <template v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                    dense
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    type="number"
                    v-model="vehicle.state"
                    :label="$t(`components.vehicle.labels.state`)"
                  />
                </td>
                <td>
                  <q-btn
                    text-color="main"
                    class="q-ml-md"
                    color="primary"
                    style="max-height: 24px"
                    @click="updateField('state')"
                    :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ vehicle.state }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.fuel`) }}
              </td>
              <template v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                    dense
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    type="number"
                    v-model="vehicle.fuel"
                    :label="$t(`components.vehicle.labels.fuel`)"
                  />
                </td>
                <td>
                  <q-btn
                    text-color="main"
                    class="q-ml-md"
                    color="primary"
                    style="max-height: 24px"
                    @click="updateField('fuel')"
                    :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ vehicle.fuel }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.engine`) }}
              </td>
              <template v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                    dense
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    type="number"
                    v-model="vehicle.engine"
                    :label="$t(`components.vehicle.labels.engine`)"
                  />
                </td>
                <td>
                  <q-btn
                    text-color="main"
                    class="q-ml-md"
                    color="primary"
                    style="max-height: 24px"
                    @click="updateField('engine')"
                    :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ vehicle.engine }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.vehicle.labels.body`) }}
              </td>
              <template v-if="can(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                    dense
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    type="number"
                    v-model="vehicle.body"
                    :label="$t(`components.vehicle.labels.body`)"
                  />
                </td>
                <td>
                  <q-btn
                    text-color="main"
                    class="q-ml-md"
                    color="primary"
                    style="max-height: 24px"
                    @click="updateField('body')"
                    :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ vehicle.body }}</td>
            </tr>
          </q-markup-table>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12">
      <div class="q-ma-sm row justify-end">
        <q-btn
          text-color="main"
          color="primary"
          @click="$router.push({ name: 'game-vehicle-list' })"
          :label="$t('general.back')"
          class="q-mr-auto"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { can } from '@core/layouts/utils'
import { ACTION, RESOURCE } from '../../../../../common/permissions'
import BasicDialog from '@/components/BasicDialog'
import BasicInput from '@/components/BasicInput.vue'

export default {
  name: 'Vehicle',
  data() {
    return {
      ACTION,
      RESOURCE,
      vehicle: {},
      oldPlate: null,
    }
  },
  methods: {
    can,
    async loadVehicle() {
      await this.$axios
        .get(`/api/vehicles/${this.$route.params.vehicleId}`)
        .then(r => {
          const vehicle = r.data.vehicle

          if (!r.data.resCode) {
            this.$q.notify({
              message: 'Error',
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
              caption: this.$i18n.t('components.vehicle.msg.error.noMatch'),
            })
            this.$router.push({ name: 'game-vehicle-list' })
            return
          }

          this.vehicle = vehicle
          this.oldPlate = vehicle.plate
        })
    },
    updatePlate() {
      this.$refs.plate.validate().then(allowed => {
        if (!allowed) {
          this.$q.notify({
            message: this.$i18n.t('general.error'),
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(
              `components.gang.msg.error.allowedCharsNumbers`
            ),
          })

          return
        }
        this.$axios
          .post(`/api/vehicles/changePlate`, {
            id: this.vehicle.id,
            plate: this.oldPlate,
            newPlate: this.vehicle.plate,
          })
          .then(r => {
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
            this.loadVehicle()
          })
          .catch(e => {})
      })
    },
    updateField(field) {
      this.$axios
        .post(`/api/vehicles/updateField`, {
          id: this.vehicle.id,
          value: this.vehicle[field],
          field: field,
          plate: this.vehicle.plate,
        })
        .then(r => {
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
          this.loadVehicle()
        })
        .catch(e => {})
    },
    changeOwner() {
      this.$q
        .dialog({
          component: BasicInput,
          componentProps: {
            title: this.$i18n.t('components.vehicle.changeOwnerHeader'),
            message: this.$i18n.t('components.vehicle.changeOwnerInput'),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(res => {
          const newOwner = res.input

          if (!newOwner) {
            this.$q.notify({
              message: this.$i18n.t('general.error'),
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
              caption: this.$i18n.t(`components.vehicle.msg.error.missingData`),
            })
            return
          }

          this.$axios
            .post(`/api/vehicles/changeOwner`, {
              id: this.vehicle.id,
              citizenid: newOwner,
            })
            .then(r => {
              const resCode = r.data.resCode

              if (!resCode) {
                const resMsg = r.data.resMsg
                this.$q.notify({
                  message: this.$i18n.t('general.error'),
                  position: 'top',
                  color: 'red',
                  icon: 'fas fa-exclamation-triangle',
                  caption: this.$i18n.t(
                    `components.vehicle.msg.error.${resMsg}`
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
              this.loadVehicle()
            })
            .catch(e => {})
        })
    },
    repairVehicle() {
      this.$axios
        .post(`/api/vehicles/repair`, {
          id: this.vehicle.id,
          plate: this.vehicle.plate,
        })
        .then(r => {
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
          this.loadVehicle()
        })
        .catch(e => {})
    },
    despawnehicle() {
      this.$q
        .dialog({
          component: BasicDialog,
          componentProps: {
            title: this.$i18n.t('components.vehicle.despawnHeader'),
            message: this.$i18n.t('components.vehicle.despawnMsg'),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.$axios
            .post(`/api/vehicles/despawn`, {
              id: this.vehicle.id,
              plate: this.vehicle.plate,
            })
            .then(r => {
              const resCode = r.data.resCode

              if (!resCode) {
                const resMsg = r.data.resMsg
                this.$q.notify({
                  message: this.$i18n.t('general.error'),
                  position: 'top',
                  color: 'red',
                  icon: 'fas fa-exclamation-triangle',
                  caption: this.$i18n.t(
                    `components.vehicle.msg.error.${resMsg}`
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
            })
            .catch(e => {})
        })
    },
    deleteVehicle() {
      this.$q
        .dialog({
          component: BasicDialog,
          componentProps: {
            title: this.$i18n.t('components.vehicle.deleteHeader'),
            message: this.$i18n.t('components.vehicle.deleteMsg'),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.$axios
            .post(`/api/vehicles/delete`, {
              id: this.vehicle.id,
              plate: this.vehicle.plate,
            })
            .then(r => {
              const resCode = r.data.resCode

              if (!resCode) {
                const resMsg = r.data.resMsg
                this.$q.notify({
                  message: this.$i18n.t('general.error'),
                  position: 'top',
                  color: 'red',
                  icon: 'fas fa-exclamation-triangle',
                  caption: this.$i18n.t(
                    `components.vehicle.msg.error.${resMsg}`
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
              this.$router.push({ name: 'game-vehicle-list' })
            })
            .catch(e => {})
        })
    },
  },
  mounted() {
    this.loadVehicle()
  },
}
</script>

<style scoped></style>
