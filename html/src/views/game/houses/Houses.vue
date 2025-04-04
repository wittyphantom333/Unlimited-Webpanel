<template>
  <div class="row">
    <!--<div class="col-12 q-pa-sm">
      <div class="row">
        <q-card class="bg-secondary row" style="width: 100%">
          <q-card-section class="q-pa-none">
            <div class="row">
              <q-btn
                  v-if="can(ACTION.GAME.HOUSES.READ, RESOURCE.GAME)"
                  text-color="main"
                  class="q-ma-md"
                  color="primary"
                  :label="$t('components.houses.buttons.openStash')"
                  @click="
            $router.push({
              name: 'game-houses-detail',
            params: {houseName: houses.houseName },
            query: {type: 'House' },
                  })
            "
              ></q-btn>
              <q-btn
                  v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)"
                  text-color="main"
                  class="q-ma-md"
                  color="primary"
                  :label="$t('components.houses.buttons.changeOwner')"
                  @click="changeOwner"
              ></q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>-->
    <div class="col-12 col-md-6 q-pa-sm">
      <q-card class="bg-secondary col-12 col-md-6" style="height: 100%">
        <q-card-section class="col-12">
          <div class="text-h6">
          <span class="text-main">{{
              $t('components.houses.header.owner')
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
                {{ $t(`components.houses.labels.owner`) }}
              </td>
              <td
                  class="text-left cursor-pointer text-primary"
                  style="text-decoration: underline"
                  v-if="can(ACTION.GAME.PLAYER.READ, RESOURCE.GAME)"
                  @click="
                  $router.push({
                    name: 'game-player-detail',
                  params: {citizenid: houses.citizenid },
                        })
                  "
              >
                {{ houses.citizenid }}
              </td>
              <td v-else class="text-left">
                {{ houses.citizenid }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.houseName`) }}
              </td>
              <td class="text-left">
                {{ houses.houseName }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.doorInside`) }}
              </td>
              <td class="text-left">{{ houses.doorInside }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.type`) }}
              </td>
              <td class="text-left">
                {{ houses.type }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.stashName`) }}
              </td>
              <td
                  class="text-left cursor-pointer text-primary"
                  style="text-decoration: underline"
                  v-if="can(ACTION.GAME.STASHES.READ, RESOURCE.GAME)"
                  @click="
                  $router.push({
                    name: 'game-stashes-detail',
                    params: { stashId: houses.stashName.replace('house_', 'apartment_') },
                    query: { type: 'Stash' }
                        })
                  "
              >
                {{ houses.stashName }}
              </td>
              <td v-else class="text-left">
                {{ houses.stashName }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.stashLevel`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="number"
                      v-model="houses.stashLevel"
                      :label="$t(`components.houses.labels.stashLevel`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      filled
                      @click="updateField('stashLevel')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.stashLevel }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.price`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="number"
                      v-model="houses.price"
                      :label="$t(`components.houses.labels.price`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('price')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.price }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.keyholders`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="string"
                      v-model="houses.keyholders"
                      :label="$t(`components.houses.labels.keyholders`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('keyholders')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.keyholders }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.extras`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="string"
                      v-model="houses.extras"
                      :label="$t(`components.houses.labels.extras`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('extras')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.extras }}</td>
            </tr>
          </q-markup-table>
        </q-card-section>
        <q-card-section class="col-12">
          <div class="text-h6">
        <span class="text-main">{{
            $t('components.houses.header.stashInfo')
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
                {{ $t(`components.houses.labels.furniture`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="string"
                      v-model="houses.furniture"
                      :label="$t(`components.houses.labels.furniture`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('furniture')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.furniture }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.maxFurnitureRange`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="number"
                      v-model="houses.maxFurnitureRange"
                      :label="$t(`components.houses.labels.maxFurnitureRange`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      filled
                      @click="updateField('maxFurnitureRange')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.maxFurnitureRange }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.logout`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="string"
                      v-model="houses.logout"
                      :label="$t(`components.houses.labels.logout`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('logout')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.logout }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.stash`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="string"
                      v-model="houses.stash"
                      :label="$t(`components.houses.labels.stash`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('stash')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.stash }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.wardrobe`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="string"
                      v-model="houses.wardrobe"
                      :label="$t(`components.houses.labels.wardrobe`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('wardrobe')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.wardrobe }}</td>
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
                $t('components.houses.header.property')
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
                {{ $t(`components.houses.labels.apart_id`) }}
              </td>
              <td class="text-left">
                {{ houses.apart_id }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.mlo`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-select
                      color="primary"
                      label-color="main"
                      v-model="houses.mlo"
                      emit-value
                      :options="isTrue"
                      :popup-content-style="{
                      backgroundColor: 'var(--q-secondary)',
                    }"
                  >
                    <template v-slot:selected>
                      <div class="text-main">
                        {{
                          houses.mlo
                              ? $t(`components.houses.general.true`)
                              : $t(`components.houses.general.false`)
                        }}
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
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('mlo')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else class="text-left">
                {{ houses.mlo }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.garden`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-select
                      color="primary"
                      label-color="main"
                      v-model="houses.garden"
                      emit-value
                      :options="isTrue"
                      :popup-content-style="{
                      backgroundColor: 'var(--q-secondary)',
                    }"
                  >
                    <template v-slot:selected>
                      <div class="text-main">
                        {{
                          houses.garden
                              ? $t(`components.houses.general.true`)
                              : $t(`components.houses.general.false`)
                        }}
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
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('garden')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.garden }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.pool`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-select
                      color="primary"
                      label-color="main"
                      v-model="houses.pool"
                      emit-value
                      :options="isTrue"
                      :popup-content-style="{
                      backgroundColor: 'var(--q-secondary)',
                    }"
                  >
                    <template v-slot:selected>
                      <div class="text-main">
                        {{
                          houses.pool
                              ? $t(`components.houses.general.true`)
                              : $t(`components.houses.general.false`)
                        }}
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
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('pool')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.pool }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.camerasystem`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-select
                      color="primary"
                      label-color="main"
                      v-model="houses.camerasystem"
                      emit-value
                      :options="isTrue"
                      :popup-content-style="{
                      backgroundColor: 'var(--q-secondary)',
                    }"
                  >
                    <template v-slot:selected>
                      <div class="text-main">
                        {{
                          houses.camerasystem
                              ? $t(`components.houses.general.true`)
                              : $t(`components.houses.general.false`)
                        }}
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
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('camerasystem')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.camerasystem }}</td>
            </tr>
          </q-markup-table>
        </q-card-section>
        <q-card-section class="col-12">
          <div class="text-h6">
            <span class="text-main">{{
                $t('components.houses.header.garage')
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
                {{ $t(`components.houses.labels.houseGarageInside`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-select
                      color="primary"
                      label-color="main"
                      v-model="houses.houseGarageInside"
                      emit-value
                      :options="garageType"
                      :popup-content-style="{
                      backgroundColor: 'var(--q-secondary)',
                    }"
                  >
                    <template v-slot:selected>
                      <div class="text-main">
                        {{ houses.houseGarageInside }}
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
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('houseGarageInside')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.houseGarageInside }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.doorCoords`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="string"
                      v-model="houses.doorCoords"
                      :label="$t(`components.houses.labels.doorCoords`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('doorCoords')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.doorCoords }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.houseGarageCoords`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="string"
                      v-model="houses.houseGarageCoords"
                      :label="$t(`components.houses.labels.houseGarageCoords`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('houseGarageCoords')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.houseGarageCoords }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.houseGarageSpawn`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="string"
                      v-model="houses.houseGarageSpawn"
                      :label="$t(`components.houses.labels.houseGarageSpawn`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('houseGarageSpawn')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.houseGarageSpawn }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t(`components.houses.labels.houseGarageStore`) }}
              </td>
              <template v-if="can(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{color: 'var(--q-main)' }"
                      filled
                      type="string"
                      v-model="houses.houseGarageStore"
                      :label="$t(`components.houses.labels.houseGarageStore`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateField('houseGarageStore')"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else>{{ houses.houseGarageStore }}</td>
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
            @click="$router.push({ name: 'game-houses-list' })"
            :label="$t('general.back')"
            class="q-mr-auto"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {can} from '@core/layouts/utils'
import {ACTION, RESOURCE} from '../../../../../common/permissions'
import BasicDialog from '@/components/BasicDialog'
import BasicInput from '@/components/BasicInput.vue'

export default {
  name: 'HOUSES',
  data() {
    return {
      ACTION,
      RESOURCE,
      houses: {},
      oldPlate: null,
      isTrue: [
        {
          label: this.$t('components.houses.general.false'),
          value: 0,
        },
        {
          label: this.$t('components.houses.general.true'),
          value: 1,
        },
      ],
      garageType: [
        {
          label: this.$t('components.houses.garageTypes.midGarage'),
          value: "midGarage",
        },
        {
          label: this.$t('components.houses.garageTypes.neonGarage'),
          value: "neonGarage",
        },
        {
          label: this.$t('components.houses.garageTypes.lowGarage'),
          value: "lowGarage",
        },
        {
          label: this.$t('components.houses.garageTypes.importGarage'),
          value: "importGarage",
        },
      ]
    }
  },
  methods: {
    can,
    async loadHOUSES() {
      await this.$axios
          .get(`/api/houses/${this.$route.params.housesId}`)
          .then(r => {
            const houses = r.data.houses

            if (!r.data.resCode) {
              this.$q.notify({
                message: 'Error',
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t('components.houses.msg.error.noMatch'),
              })
              this.$router.push({name: 'game-houses-list'})
              return
            }

            this.houses = houses
            this.oldPlate = houses.plate
          })
    },
    updateOwner() {
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
            .post(`/api/houses/changePlate`, {
              id: this.houses.id,
              plate: this.oldPlate,
              newPlate: this.houses.plate,
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
                  caption: this.$i18n.t(`components.houses.msg.error.${resMsg}`),
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
              this.loadHOUSES()
            })
            .catch(e => {
            })
      })
    },
    updateField(field) {
      this.$axios
          .post(`/api/houses/updateField`, {
            houseName: this.houses.houseName,
            value: this.houses[field],
            field: field,
            citizenid: this.houses.citizenid,
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
                caption: this.$i18n.t(`components.houses.msg.error.${resMsg}`),
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
            this.loadHOUSES()
          })
          .catch(e => {
          })
    },
    changeOwner() {
      this.$q
          .dialog({
            component: BasicInput,
            componentProps: {
              title: this.$i18n.t('components.houses.changeOwnerHeader'),
              message: this.$i18n.t('components.houses.changeOwnerInput'),
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
                caption: this.$i18n.t(`components.houses.msg.error.missingData`),
              })
              return
            }

            this.$axios
                .post(`/api/houses/changeOwner`, {
                  id: this.houses.id,
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
                          `components.houses.msg.error.${resMsg}`
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
                  this.loadHOUSES()
                })
                .catch(e => {
                })
          })
    },
  },
  mounted() {
    this.loadHOUSES()
  },
}
</script>

<style scoped></style>
