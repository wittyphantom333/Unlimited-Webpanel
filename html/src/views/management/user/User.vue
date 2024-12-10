<template>
  <div class="row">
    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width row">
          <q-card-section class="col-12">
            <div class="text-h6">
              {{ $t(`components.user.edit`) }}:
              <span class="text-primary">{{ user.name }}</span>
            </div>
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
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
          <q-card-section class="col-12 col-md-6 text-center">
            <q-btn
              text-color="main"
              v-if="can(ACTION.WEB.USER.MODIFY, RESOURCE.WEB)"
              color="primary"
              @click="resetPassword"
              :label="$t('components.user.resetPasswort')"
              class="q-ma-sm"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="col-12">
      <div class="q-ma-sm row justify-end">
        <q-btn
          text-color="main"
          :disable="pendingDelete || pendingSave"
          color="primary"
          @click="$router.push({ name: 'web-user-list' })"
          :label="$t('general.back')"
          class="q-mr-auto"
        />
        <q-btn
          text-color="main"
          v-if="can(ACTION.WEB.USER.MODIFY, RESOURCE.WEB)"
          :loading="pendingSave"
          :disable="pendingDelete"
          color="primary"
          @click="trySave"
          :label="$t('general.save')"
          class="q-mr-sm"
        />
        <q-btn
          text-color="main"
          v-if="can(ACTION.WEB.USER.DELETE, RESOURCE.WEB)"
          :loading="pendingDelete"
          :disable="pendingSave"
          color="negative"
          @click="tryDelete"
          :label="$t('general.delete')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ACTION, RESOURCE } from '../../../../../common/permissions'
import { can } from '@core/layouts/utils'
import BasicDialog from '../../../components/BasicDialog'
import BasicPrompt from '@/components/BasicPrompt'

export default {
  name: 'User',
  data() {
    return {
      RESOURCE,
      ACTION,
      pendingSave: false,
      pendingDelete: false,
      user: {},
      roles: [],
    }
  },
  computed: {
    getRoleColor() {
      if (!this.user.roleId) return 'primary'

      return this.roles.find(r => (r.name = this.user.roleId)).color
    },
  },
  methods: {
    can,
    trySave() {
      this.pendingSave = true

      this.$axios
        .patch(`/api/users/save/${this.user.name}`, this.user)
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
        })
        .catch(e => {})
    },
    tryDelete() {
      this.pendingDelete = true

      this.$q
        .dialog({
          component: BasicDialog,
          componentProps: {
            title: this.$i18n.t('components.user.deleteHeader'),
            message: this.$i18n.t('components.user.deleteMsg', {
              name: this.user.name,
            }),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.$axios
            .delete(`/api/users/delete/${this.user.name}`)
            .then(r => {
              this.pendingDelete = false
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
                caption: this.$i18n.t('general.deleted'),
              })
              this.$router.push({ name: 'web-user-list' })
            })
            .catch(e => {})
        })
        .onCancel(() => {
          this.pendingDelete = false
        })
    },
    resetPassword() {
      this.$q
        .dialog({
          component: BasicDialog,
          componentProps: {
            title: this.$i18n.t('components.user.resetPasswordHeader'),
            message: this.$i18n.t('components.user.resetPasswordMsg', {
              name: this.user.name,
            }),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.$axios
            .post(`/api/users/password/reset`, { userId: this.user.name })
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

              this.$q.dialog({
                component: BasicPrompt,
                componentProps: {
                  title: this.$i18n.t('general.success'),
                  message: `<pre class="text-center bg-dark q-pa-sm rounded-borders"><code>${r.data.newPw}</code></pre>`,
                },
                cancel: true,
                persistent: true,
              })
            })
            .catch(e => {})
        })
    },
  },
  mounted() {
    this.$axios.get(`/api/users/${this.$route.params.userId}`).then(r => {
      const user = r.data.user
      const roles = r.data.roles

      if (!user || !roles) {
        this.$q.notify({
          message: r.data.msg,
          position: 'top',
          color: 'red',
          icon: 'fas fa-exclamation-triangle',
          caption: 'Error',
        })
        return
      }

      this.user = user
      this.roles = roles
    })
  },
}
</script>

<style scoped></style>
