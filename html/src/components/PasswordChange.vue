<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin bg-secondary text-main">
      <q-card-section class="row">
        <div class="text-body2" v-html="message"></div>
        <q-icon
          class="q-ml-auto cursor-pointer"
          name="close"
          @click.stop="hide"
        ></q-icon>
      </q-card-section>
      <q-card-section>
        <q-form ref="pwChangeForm">
          <q-input
            label-color="primary"
            :input-style="{ color: 'var(--q-main)' }"
            :label="$t(`general.password`)"
            v-model="password"
            filled
            lazy-rules
            :type="isPwd ? 'password' : 'text'"
            :rules="[
              val => (val && val.length > 0) || $t('rules.required'),
              val => (val && !/\s/.test(val)) || $t('rules.noSpace'),
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer text-primary"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <q-input
            label-color="primary"
            :input-style="{ color: 'var(--q-main)' }"
            filled
            v-model="passwordCon"
            :label="$t(`general.confirmPassword`)"
            lazy-rules
            :type="isPwd ? 'password' : 'text'"
            :rules="ConfirmPWD"
          />
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
export default {
  data() {
    return { password: '', passwordCon: '', isPwd: true }
  },
  props: {
    title: String,
    message: String,
    label: String,
  },
  computed: {
    ConfirmPWD() {
      return [
        v => !!v || this.$t('rules.required'),
        v => v === this.password || this.$t('rules.passwordConfirm'),
        v => (v && !/\s/.test(v)) || this.$t('rules.noSpace'),
      ]
    },
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
      this.$refs.pwChangeForm.validate().then(success => {
        if (success) {
          this.$emit('ok', { input: this.password })
          this.hide()
        }
      })
    },
    onCancelClick() {
      this.hide()
    },
  },
}
</script>
