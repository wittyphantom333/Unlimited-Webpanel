<template>
  <div id="auth-loading">
    <div class="loading-logo">
      <img src="../../logo.png" alt="Logo" />
    </div>
    <div class="loading">
      <div class="effect-1 effects"></div>
      <div class="effect-2 effects"></div>
      <div class="effect-3 effects"></div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia'
import { useUserStore } from '@stores/user'

export default {
  name: 'AuthProcess',
  methods: {
    ...mapActions(useUserStore, ['UPDATE_ACCESS_TOKEN', 'UPDATE_USER_DATA']),
    queryString(params) {
      return Object.keys(params)
        .map(key => {
          return key + '=' + encodeURIComponent(params[key])
        })
        .join('&')
    },
  },
  mounted() {
    this.$axios
      .post(
        `/auth/${this.$route.params.provider}/callback?${this.queryString(
          this.$route.query
        )}`
      )
      .then(r => {
        const resCode = r.data.resCode
        const resMsg = r.data.resMsg

        if (!resCode) {
          this.$q.notify({
            message: this.$t('general.error'),
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$t(`components.auth.msg.error.${resMsg}`),
          })
          this.$router.push({ name: 'auth-login' })
          return
        }

        this.UPDATE_ACCESS_TOKEN(r.data.accessToken)
        this.UPDATE_USER_DATA(r.data.userData)
        this.$socket.connect()

        this.$router.push({ path: '/' })
      })
  },
}
</script>

<style>
#auth-loading {
  width: 100%;
  height: 100%;
  background: var(--q-dark);
  display: block;
  position: absolute;
}
</style>
