<template>
  <q-dialog ref="dialog" @hide="onDialogHide" maximized>
    <q-card class="q-dialog-plugin bg-secondary text-main">
      <q-card-section class="row">
        <div
          class="text-body2"
          v-html="$t('components.player.playerScreenHeader')"
        ></div>
        <q-icon
          class="q-ml-auto cursor-pointer"
          name="close"
          @click.stop="hide"
        ></q-icon>
      </q-card-section>
      <q-card-section align="center">
        <q-img
          :src="img"
          spinner-color="primary"
          fit="contain"
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
  name: 'PlayerScreen',
  emits: ['ok', 'hide'],
  props: {
    img: String,
  },
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
      this.$emit('ok')
      this.hide()
    },
    onCancelClick() {
      this.hide()
    },
  },
}
</script>

<style scoped></style>
