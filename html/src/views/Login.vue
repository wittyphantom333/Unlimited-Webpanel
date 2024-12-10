<template>
  <div class="row flex-center justify-center" style="height: 100vh">
    <q-card class="bg-secondary q-pa-sm" style="max-width: 340px">
      <q-card-section>
        <div class="q-pa-md">
          <q-img :src="logoUrl" fit="fill" />
        </div>

        <div class="text-h6 q-mt-lg">Login</div>
        <div class="text-caption text-sub">
          {{ $t(`components.login.subtext`) }}
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row">
          <div class="col-12">
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              v-model="username"
              :label="$t(`general.username`)"
              lazy-rules
            />
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <q-input
              class="q-mt-sm"
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              v-model="password"
              :type="isPwd ? 'password' : 'text'"
              :label="$t(`general.password`)"
              lazy-rules
              @keydown.enter.prevent="tryLogin"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer text-primary"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-separator inset />

      <q-card-actions vertical>
        <q-btn
          text-color="main"
          :loading="loading"
          color="primary"
          @click="tryLogin"
          label="Login"
          class="q-ma-sm"
        />
        <div class="text-center">{{ $t('general.or') }}</div>
        <q-btn
          text-color="main"
          @click="tryProviderLogin('citizenfx')"
          style="background: #3e4450"
          class="q-ma-sm"
        >
          <q-icon>
            <img src="@core/assets/fivem.svg" />
          </q-icon>
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { mapActions } from 'pinia'
import { useUserStore } from '@stores/user'
import jwt from '@core/auth/jwt/useJWT'
import qs from 'qs'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Login',
  data() {
    return {
      password: '',
      username: '',
      isPwd: true,
      loading: false,
    }
  },
  computed: {
    logoUrl() {
      return new URL('../../logo.png', import.meta.url).href
    },
  },
  methods: {
    ...mapActions(useUserStore, ['UPDATE_ACCESS_TOKEN', 'UPDATE_USER_DATA']),
    tryProviderLogin(provider) {
      this.$axios
        .post(`/auth/${provider}`)
        .then(r => {
          const resCode = r.data.resCode
          const resMsg = r.data.resMsg

          if (!resCode) {
            this.$q.notify({
              message: this.$t('general.error'),
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
              caption: this.$t(`components.login.msg.error.${resMsg}`),
            })
            return
          }

          window.location = resMsg
        })
        .catch(e => {
          console.error(e)
        })
    },
    tryLogin() {
      const params = qs.stringify({
        username: this.username,
        password: this.password,
      })

      this.loading = true

      jwt
        .login(params)
        .then(r => {
          this.loading = false

          if (r.data.status === 200) {
            this.UPDATE_ACCESS_TOKEN(r.data.accessToken)
            this.UPDATE_USER_DATA(r.data.userData)
            this.$socket.connect()

            this.$router.push({ path: '/' })
          } else {
            this.$q.notify({
              message: r.data.error.title,
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
              caption: r.data.error.msg,
            })
          }
        })
        .catch(() => {
          this.loading = false
          this.$q.notify({
            message: this.$t('general.error'),
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$t('general.cantReach'),
          })
        })
    },
  },
}
</script>

<style scoped></style>
