<template>
  <div class="row">
    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width">
          <q-form ref="userForm" class="row">
            <q-card-section class="col-12 col-md-6">
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                v-model="user.name"
                :label="$t(`general.username`)"
                lazy-rules
                :rules="[
                  val => (val && val.length > 0) || $t('rules.required'),
                  val => (val && !/\s/.test(val)) || $t('rules.noSpace'),
                ]"
              />
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                filled
                placeholder="Unlimited.wtf"
                v-model="user.fxname"
                :label="$t(`components.user.fxname`)"
              />
              <q-select
                class="q-mt-md"
                :label="$t('components.user.role')"
                color="primary"
                label-color="primary"
                filled
                v-model="user.roleId"
                emit-value
                input-class="text-main"
                input-debounce="0"
                :options="roles"
                popup-content-class="bg-secondary text-main"
              >
                <template v-slot:selected>
                  <div class="text-main">{{ user.roleId }}</div>
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label :class="`text-${scope.opt.color}`">{{
                        scope.opt.value
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </q-card-section>
            <q-card-section class="col-12 col-md-6">
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                :label="$t(`general.password`)"
                v-model="user.password"
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
            </q-card-section>
          </q-form>
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
export default {
  name: 'UserCreate',
  data() {
    return {
      pendingSave: false,
      user: {
        name: '',
        roleId: '',
        password: '',
        fxname: '',
      },
      isPwd: true,
      passwordCon: '',
      roles: [],
    }
  },
  computed: {
    ConfirmPWD() {
      return [
        v => !!v || this.$t('rules.required'),
        v => v === this.user.password || this.$t('rules.passwordConfirm'),
        v => (v && !/\s/.test(v)) || this.$t('rules.noSpace'),
      ]
    },
  },
  methods: {
    trySave() {
      this.$refs.userForm.validate().then(success => {
        if (!success) {
          this.$q.notify({
            message: this.$i18n.t('general.error'),
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(`components.user.msg.error.missingFields`, {
              name: this.user.name,
            }),
          })

          return
        }

        this.pendingSave = true
        this.$axios
          .post(`/api/users/create`, this.user)
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
                caption: this.$i18n.t(`components.user.msg.error.${resMsg}`, {
                  name: this.user.name,
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
            this.$router.push({ name: 'web-user-list' })
          })
          .catch(e => {})
      })
    },
  },
  mounted() {
    this.$axios
      .get(`/api/roles/list`)
      .then(r => {
        const roles = r.data.roles

        if (!roles) {
          this.$q.notify({
            message: r.data.msg,
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: 'Error',
          })
          return
        }

        this.roles = Object.freeze(roles)
      })
      .catch(e => {
        console.error(e)
      })
  },
}
</script>

<style scoped></style>
