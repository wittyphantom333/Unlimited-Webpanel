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
        <div class="text-subtitle1 q-mb-md" v-html="message"></div>
        <q-input
          label-color="primary"
          :input-style="{ color: 'var(--q-main)' }"
          filled
          v-model="input"
          :label="$t('general.reason')"
        />
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
export default {
  data() {
    return { input: '' }
  },
  props: {
    title: String,
    message: String,
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
      this.$emit('ok', { input: this.input })
      this.hide()
    },
    onCancelClick() {
      this.hide()
    },
  },
}
</script>
