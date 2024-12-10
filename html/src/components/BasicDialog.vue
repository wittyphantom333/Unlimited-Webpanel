<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin bg-secondary text-main">
      <q-card-section>
        <div class="text-h5">{{ title }}</div>
        <q-separator class="q-mt-sm"></q-separator>
      </q-card-section>
      <q-card-section>
        <div class="text-body2" v-html="message"></div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          text-color="main"
          color="primary"
          :label="$t('general.ok')"
          @click="onOKClick"
        />
        <q-btn
          text-color="main"
          color="negative"
          :label="$t('general.cancel')"
          @click="onCancelClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    title: String,
    message: String,
  },

  emits: [
    // REQUIRED
    'ok',
    'hide',
  ],

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide()
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok')
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide()
    },

    onCancelClick() {
      // we just need to hide the dialog
      this.hide()
    },
  },
}
</script>
