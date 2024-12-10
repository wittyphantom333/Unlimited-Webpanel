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
        <q-input
          label-color="primary"
          :input-style="{ color: 'var(--q-main)' }"
          filled
          type="number"
          class="q-mt-md"
          v-model.number="editedItem.amount"
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
          :label="$t('general.ok')"
          @click="onOKClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import BasicDialog from '@/components/BasicDialog'

export default {
  name: 'EditInventoryItem',
  data() {
    return {
      info: [],
      editedItem: {},
    }
  },
  props: {
    title: String,
    item: Object,
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

          this.editedItem.info[info.name] = this.isNumeric(info.value)
            ? Number(info.value)
            : this.isBoolean(info.value)
        })

        this.$emit('ok', { item: this.editedItem })
        this.hide()
      })
    },
    onCancelClick() {
      this.hide()
    },
  },
  mounted() {
    this.editedItem = this.item
    for (const [key, value] of Object.entries(this.item.info)) {
      this.info.push({ name: key, value: value })
    }
    this.editedItem.info = {}
  },
}
</script>
