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
          :label="$t('components.inventory.itemName')"
          color="primary"
          label-color="primary"
          filled
          v-model="item.name"
          :options="itemAccept"
          popup-content-class="bg-secondary text-main"
          use-input
          emit-value
          input-class="text-main"
          @filter="filterItems"
        >
          <template v-slot:selected>
            <div class="text-main">
              {{ getItemLabel }}
            </div>
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-img
                  :src="`${externalHosting.backend}/public/inventory/icons/${scope.opt.image}`"
                  spinner-color="primary"
                  fit="contain"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-main">{{
                  scope.opt.label
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input
          label-color="primary"
          :input-style="{ color: 'var(--q-main)' }"
          filled
          type="number"
          class="q-mt-md"
          v-model.number="item.amount"
          :label="$t(`components.inventory.amount`)"
        />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div>
            <div class="text-h6">
              {{ $t('components.inventory.infoSection') }}
            </div>
            <div class="text-caption text-sub">
              {{ $t('components.inventory.infoSectionSub') }}
            </div>
          </div>
        </div>
        <div class="row q-mt-sm">
          <q-btn
            text-color="main"
            color="primary"
            :label="$t('components.inventory.addInfoValue')"
            @click="addInfo"
          />
        </div>
      </q-card-section>
      <q-card-section>
        <q-form ref="infoForm">
          <q-markup-table
            class="bg-secondary text-main"
            flat
            square
            separator="none"
          >
            <tbody>
              <tr
                v-for="(infoEntry, index) in info"
                :key="`${index}-infoField`"
              >
                <td>
                  <q-input
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    v-model="infoEntry.name"
                    :label="$t(`components.inventory.infoName`)"
                    lazy-rules
                    :rules="[
                      val => (val && val.length > 0) || $t('rules.required'),
                      val => (val && !/\s/.test(val)) || $t('rules.noSpace'),
                      val =>
                        (val && info.filter(v => v.name === val).length <= 1) ||
                        $t('rules.unique'),
                    ]"
                  />
                </td>
                <td>
                  <q-input
                    label-color="primary"
                    :input-style="{ color: 'var(--q-main)' }"
                    filled
                    class="q-field--with-bottom"
                    v-model="infoEntry.value"
                    :label="$t(`components.inventory.infoValue`)"
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
                    @click="removeInfo(infoEntry)"
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
      <q-card-actions align="center">
        <q-btn
          text-color="main"
          color="primary"
          :label="$t('general.add')"
          @click="onOKClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { externalHosting } from '../../../common/externalHosting'
import BasicDialog from '@/components/BasicDialog'

export default {
  name: 'AddInventoryItem',
  data() {
    return {
      externalHosting,
      item: { info: {} },
      items: null,
      itemAccept: [''],
      info: [],
    }
  },
  computed: {
    getItemLabel() {
      if (!this.items) return ''

      const item = this.items.find(x => x.value === this.item.name)

      if (!item) {
        return this.item.name
      }

      return item.label
    },
  },
  props: {
    title: String,
  },
  emits: ['ok', 'hide'],
  methods: {
    isNumeric(str) {
      if (typeof str != 'string') return false
      return !isNaN(str) && !isNaN(parseFloat(str))
    },
    isBoolean(str) {
      return str === 'true' || (str === 'false' ? false : str)
    },
    filterItems(val, update) {
      const input = val?.toLowerCase()
      this.itemAccept = Object.freeze(
        this.items.filter(v => v.label?.toLowerCase().indexOf(input) > -1)
      )
      update()
    },
    addInfo() {
      this.info.push({ name: '', value: '' })
    },
    removeInfo(row) {
      const index = this.info.indexOf(row)

      if (index > -1)
        this.$q
          .dialog({
            component: BasicDialog,
            componentProps: {
              title: this.$i18n.t('components.inventory.deleteInfoHeader'),
              message: this.$i18n.t('components.inventory.deleteInfoMsg', {
                name: row.name,
              }),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(() => {
            this.info.splice(index, 1)
          })
    },
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
      this.$refs.infoForm.validate().then(unique => {
        if (!unique) {
          this.$q.notify({
            message: this.$i18n.t('general.error'),
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(`components.inventory.msg.error.uniqueInfo`),
          })

          return
        }

        this.info.forEach(info => {
          if (!info.name) return

          this.item.info[info.name] = this.isNumeric(info.value)
            ? Number(info.value)
            : this.isBoolean(info.value)
        })

        this.$emit('ok', { item: this.item })
        this.hide()
      })
    },
    onCancelClick() {
      this.hide()
    },
  },
  async mounted() {
    await this.$axios
      .get(`/api/items/item-list`)
      .then(r => {
        const items = r.data.items

        if (!items) {
          this.$q.notify({
            message: 'Error',
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(
              'components.inventory.msg.error.failedFetchItems'
            ),
          })
          this.hide()
          return
        }

        this.items = items
      })
      .catch(() => {
        this.$q.notify({
          message: 'Error',
          position: 'top',
          color: 'red',
          icon: 'fas fa-exclamation-triangle',
          caption: this.$i18n.t(
            'components.inventory.msg.error.failedFetchItems'
          ),
        })
        this.hide()
      })
  },
}
</script>
