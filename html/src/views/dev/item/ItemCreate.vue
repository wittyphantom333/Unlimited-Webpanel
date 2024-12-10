<template>
  <div class="row">
    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width row">
          <q-card-section class="col-12">
            <div class="text-h6">{{ $t(`components.itemCreate.new`) }}:</div>
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-form ref="itemForm">
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                v-model="item.name"
                @change="
                  val => {
                    item.name = val.toLowerCase()
                  }
                "
                lazy-rules
                :rules="[
                  val => (val && val.length > 0) || $t('rules.required'),
                  val => (val && !/\s/.test(val)) || $t('rules.noSpace'),
                ]"
                :label="$t(`components.item.name`)"
              />
            </q-form>
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              class="q-mt-md"
              v-model="item.label"
              :label="$t(`components.item.label`)"
            />
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              class="q-mt-md"
              v-model="item.description"
              :label="$t(`components.item.desc`)"
            />
            <input
              ref="image"
              type="file"
              @input="uploadImage"
              hidden
              accept="image/png, image/jpeg"
            />
            <q-select
              :label="$t('components.item.image')"
              color="primary"
              label-color="primary"
              filled
              class="q-mt-md"
              v-model="item.image"
              :options="imageAccept"
              popup-content-class="bg-secondary text-main"
              use-input
              input-class="text-main"
              @filter="filterImage"
            >
              <template v-slot:after>
                <q-btn
                  text-color="main"
                  square
                  color="primary"
                  icon="file_upload"
                  @click="triggerFileSelect"
                >
                  <q-tooltip> {{ $t('components.item.uploadNew') }} </q-tooltip>
                </q-btn>
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-img
                      :src="`${externalHosting.backend}/public/inventory/icons/${scope.opt}`"
                      spinner-color="primary"
                      fit="contain"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-main">{{
                      scope.opt
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <div class="row full-width justify-center q-mt-md">
              <div
                class="q-pa-sm"
                style="
                  border: solid 2px var(--q-primary);
                  height: 140px;
                  width: 150px;
                "
              >
                <q-img
                  :src="`${externalHosting.backend}/public/inventory/icons/${item.image}`"
                  class="full-height"
                  spinner-color="main"
                >
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center text-main">
                      {{ $t('components.item.imageNotFound') }}
                    </div>
                  </template>
                </q-img>
              </div>
            </div>
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              type="number"
              v-model.number="item.weight"
              :label="$t(`components.item.weight`)"
            />
            <q-select
              :label="$t('components.item.type')"
              color="primary"
              label-color="primary"
              filled
              class="q-mt-md"
              v-model="item.type"
              :options="itemTypes"
              popup-content-class="bg-secondary text-main"
            >
              <template v-slot:selected>
                <q-badge :color="item.type === 'item' ? 'primary' : 'negative'">
                  {{ item.type }}
                </q-badge>
              </template>
            </q-select>
            <div class="row q-mt-md">
              <q-checkbox
                v-model="item.useable"
                :label="$t('components.item.useable')"
              />
            </div>
            <div class="row q-mt-md">
              <q-checkbox
                v-model="item.unique"
                :label="$t('components.item.unique')"
              />
            </div>
            <div class="row q-mt-md">
              <q-checkbox
                v-model="item.shouldClose"
                :label="$t('components.item.shouldClose')"
              />
            </div>
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
                  {{ $t('components.item.customVariables') }}
                </div>
                <div class="text-caption text-sub">
                  {{ $t('components.item.customVarSub') }}
                </div>
              </div>
              <div class="q-ml-auto">
                <q-btn
                  text-color="main"
                  color="primary"
                  :label="$t('components.item.addCustomVar')"
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
                        :label="$t(`components.item.customVarName`)"
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
                        :label="$t(`components.item.customVarValue`)"
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
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width row">
          <q-card-section class="col-12">
            <div class="text-h6">{{ $t('components.item.combinability') }}</div>
            <div class="text-caption text-sub">
              {{ $t('components.item.combinabSub') }}
            </div>
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-select
              ref="accept"
              :label="$t('components.item.combinable.accept')"
              color="primary"
              label-color="primary"
              filled
              multiple
              v-model="combinable.accept"
              :options="itemsAccept"
              popup-content-class="bg-secondary text-main"
              use-input
              use-chips
              emit-value
              input-class="text-main"
              @filter="filterAccept"
            >
            </q-select>
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-select
              class="text-main"
              :label="$t('components.item.combinable.reward')"
              color="primary"
              label-color="primary"
              filled
              v-model="combinable.reward"
              :options="itemsReward"
              popup-content-class="bg-secondary text-main"
              use-input
              emit-value
              input-class="text-main"
              input-debounce="0"
              @filter="filterReward"
            >
              <template v-slot:selected>
                <div class="text-main">
                  {{ getRewardLabel }}
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

              <template v-if="combinable.reward" v-slot:append>
                <q-icon
                  name="cancel"
                  @click.stop.prevent="combinable.reward = ''"
                  class="cursor-pointer text-primary"
                />
              </template>
            </q-select>
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              class="q-mt-md"
              v-model="combinable.anim.text"
              :label="$t(`components.item.combinable.text`)"
            />
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              type="number"
              class="q-mt-md"
              v-model.number="combinable.anim.timeOut"
              :label="$t(`components.item.combinable.timeOut`)"
            />
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              class="q-mt-md"
              v-model="combinable.anim.lib"
              :label="$t(`components.item.combinable.lib`)"
            />
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              class="q-mt-md"
              v-model="combinable.anim.dict"
              :label="$t(`components.item.combinable.dict`)"
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
          @click="trySave"
          :label="$t('general.create')"
          class="q-mr-sm"
        />
      </div>
    </div>
  </div>
</template>

<script>
import BasicDialog from '@/components/BasicDialog'
import { externalHosting } from '../../../../../common/externalHosting'

const defaultCombinable = {
  anim: {
    lib: '',
    dict: '',
    text: '',
    timeOut: null,
  },
  accept: [],
  reward: '',
}

export default {
  name: 'ItemCreate',
  data() {
    return {
      externalHosting,
      defaults: [
        'shouldclose',
        'type',
        'description',
        'weight',
        'label',
        'unique',
        'useable',
        'image',
        'name',
        'combinable',
      ],
      pendingSave: false,
      item: {
        shouldClose: false,
        type: 'item',
        description: '',
        weight: 0,
        label: '',
        unique: false,
        useable: false,
        image: '',
        name: '',
      },
      customVars: [],
      itemTypes: ['item', 'weapon'],
      items: [],
      itemImages: [],
      itemsReward: [],
      itemsAccept: [''],
      imageAccept: [''],
      combinable: defaultCombinable,
    }
  },
  computed: {
    getRewardLabel() {
      const item = this.items.find(x => x.value === this.combinable.reward)

      if (!item) {
        return this.combinable.reward
      }

      return item.label
    },
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
              title: this.$i18n.t('components.item.deleteHeader'),
              message: this.$i18n.t('components.item.deleteCustomVarMsg', {
                name: row.name,
              }),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(() => {
            this.customVars.splice(index, 1)
          })
    },
    triggerFileSelect() {
      this.$refs.image.value = null
      this.$refs.image.click()
    },
    uploadImage(event) {
      if (!this.$refs.image.value) return
      const file = event.target.files[0]
      let formData = new FormData()
      formData.set('file', file)
      formData.set('name', file.name)

      this.$axios.post('/api/items/icon-upload', formData).then(r => {
        const resCode = r.data.resCode

        if (!resCode) {
          const resMsg = r.data.resMsg
          this.$q.notify({
            message: this.$i18n.t('general.error'),
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(`components.item.msg.error.${resMsg}`),
          })
          return
        }

        this.$q.notify({
          message: this.$i18n.t('general.success'),
          position: 'top',
          color: 'green',
          icon: 'fas fa-check',
          caption: this.$i18n.t('components.item.uploadedImage'),
        })

        this.itemImages = Object.freeze(r.data.images)
        this.item.image = r.data.filename
      })
    },
    trySave() {
      this.$refs.itemForm.validate().then(success => {
        if (!success) {
          this.$q.notify({
            message: this.$i18n.t('general.error'),
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(`components.item.msg.error.missingFields`, {
              name: this.item.name,
            }),
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
              caption: this.$i18n.t(`components.item.msg.error.uniqueVars`),
            })

            return
          }

          this.customVars.forEach(customVar => {
            if (!customVar.name) return
            this.item[customVar.name] = this.isNumeric(customVar.value)
              ? Number(customVar.value)
              : this.isBoolean(customVar.value)
          })

          this.pendingSave = true

          if (
            Object.entries(this.combinable).sort().toString() !==
            Object.entries(defaultCombinable).sort().toString()
          )
            this.item.combinable = this.combinable

          this.$axios
            .post(`/api/items/create`, this.item)
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
                  caption: this.$i18n.t(`components.item.msg.error.${resMsg}`, {
                    name: this.item.name,
                  }),
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
              this.$router.push({ name: 'dev-item-list' })
            })
            .catch(() => {})
        })
      })
    },
    filterAccept(val, update) {
      const input = val.toLowerCase()
      this.itemsAccept = Object.freeze(
        this.items.filter(v => v.label.toLowerCase().indexOf(input) > -1)
      )
      update()
    },
    filterImage(val, update) {
      const input = val.toLowerCase()
      this.imageAccept = Object.freeze(
        this.itemImages.filter(v => v.toLowerCase().indexOf(input) > -1)
      )
      update()
    },
    filterReward(val, update) {
      const input = val.toLowerCase()
      this.itemsReward = Object.freeze(
        this.items.filter(v => v.label.toLowerCase().indexOf(input) > -1)
      )
      update()
    },
  },
  mounted() {
    this.$axios
      .get(`/api/items/list`)
      .then(r => {
        const items = r.data.items
        const images = r.data.images

        if (!items || !images) {
          this.$q.notify({
            message: r.data.msg,
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: 'Error',
          })
          return
        }

        this.items = Object.freeze(items)
        this.itemImages = Object.freeze(images)
        this.item.combinable
          ? (this.combinable = this.item.combinable)
          : (this.combinable = JSON.parse(JSON.stringify(defaultCombinable)))
      })
      .catch(e => {
        console.error(e)
      })
  },
}
</script>

<style>
.q-table__middle {
  overflow-y: hidden;
  overflow-x: auto;
}

div.q-field__native.row.items-center > span {
  color: var(--q-main);
}
</style>
