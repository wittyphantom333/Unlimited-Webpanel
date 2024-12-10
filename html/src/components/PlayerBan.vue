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
        <div class="row justify-center">
          <q-btn
            text-color="main"
            color="primary"
            label="1h"
            class="q-mt-md q-mx-xs text-lowercase"
            @click="time = 3600"
          />
          <q-btn
            text-color="main"
            color="primary"
            label="1d"
            class="q-mt-md q-mx-xs text-lowercase"
            @click="time = 3600 * 24"
          />
          <q-btn
            text-color="main"
            color="primary"
            label="3d"
            class="q-mt-md q-mx-xs text-lowercase"
            @click="time = 3600 * 24 * 3"
          />
          <q-btn
            text-color="main"
            color="primary"
            label="7d"
            class="q-mt-md q-mx-xs text-lowercase"
            @click="time = 3600 * 24 * 7"
          />
          <q-btn
            text-color="main"
            color="primary"
            label="14d"
            class="q-mt-md q-mx-xs text-lowercase"
            @click="time = 3600 * 24 * 14"
          />
          <q-btn
            text-color="main"
            color="primary"
            label="perm"
            class="q-mt-md q-mx-xs text-lowercase"
            @click="time = 2147483647"
          />
        </div>
        <q-input
          label-color="primary"
          :input-style="{ color: 'var(--q-main)' }"
          filled
          class="q-mt-md"
          type="number"
          v-model="time"
          :label="$t('general.time')"
        />
        <div class="text-caption text-sub q-mt-sm">
          {{ $t('general.bantime') }}
        </div>
        <q-toggle class="q-mt-md text-primary" color="primary" v-model="hwid" label="HWID" left-label />
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
    return { input: '', time: 0, hwid: false }
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
      this.$emit('ok', { input: this.input, time: this.time, hwid: this.hwid })
      this.hide()
    },
    onCancelClick() {
      this.hide()
    },
  },
}
</script>
