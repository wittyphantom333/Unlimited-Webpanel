<template>
  <q-layout view="lHh LpR lff" class="bg-dark text-main">
    <q-header elevated class="bg-secondary">
      <q-toolbar>
        <!--    Sidebar Toggler    -->
        <q-btn
          color="main"
          dense
          flat
          icon="menu"
          @click.stop="drawer = !drawer"
        />

        <div class="q-ml-auto">
          <!--    Change Password    -->
          <q-btn
            text-color="main"
            class="text-primary"
            dense
            flat
            icon="key"
            @click="openPasswordChange"
          >
            <q-tooltip>
              {{ $t('general.changePassword') }}
            </q-tooltip>
          </q-btn>
          <!--    Logout Button    -->
          <q-btn
            text-color="main"
            class="text-red-6 q-ml-sm"
            dense
            flat
            icon="logout"
            @click="Logout"
          >
            <q-tooltip>
              {{ $t('general.logout') }}
            </q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      class="bg-secondary"
      dark
      show-if-above
      v-model="drawer"
      side="left"
    >
      <div to="/" class="q-ml-md row items-center">
        <q-avatar class="brand-logo">
          <img :src="logoUrl" />
        </q-avatar>

        <h2 class="q-pl-lg brand-text">Admin Panel</h2>
      </div>

      <q-list>
        <component
          :is="resolveNavItemComponent(item)"
          v-for="item in navigationItems"
          :key="item.header || item.title"
          :item="item"
        />
      </q-list>
    </q-drawer>

    <!-- Provides the application the proper gutter -->
    <q-page-container fluid>
      <!-- If using vue-router -->
      <div class="q-pa-md">
        <AppBreadcrumb></AppBreadcrumb>
        <slot></slot>
      </div>
    </q-page-container>

    <q-footer class="bg-transparent q-px-md q-pb-sm">
      <div class="text-subtitle2 text-sub">
        COPYRIGHT © 2022 - {{ new Date().getFullYear() }}
        <a
          href="https://discord.unlimited.wtf"
          target="_blank"
          style="text-decoration: none"
          ><span class="text-primary">Unlimited</span></a
        >, All rights Reserved
      </div>
    </q-footer>
  </q-layout>
</template>

<script>
import navigationItems from '@core/navigation'

import VerticalNavMenuLink from './components/VerticalNavMenuLink.vue'
import VerticalNavMenuHeader from './components/VerticalNavMenuHeader.vue'
import VerticalNavMenuGroup from './components/VerticalNavMenuGroup.vue'

import { resolveVerticalNavMenuItemComponent as resolveNavItemComponent } from '../utils'
import jwt from '@core/auth/jwt/useJwt'
import { mapActions } from 'pinia'

import { useUserStore } from '@stores/user'
import AppBreadcrumb from '@core/layouts/AppBreadcrumb'
import PasswordChange from '@/components/PasswordChange'

export default {
  name: 'LayoutVertical',
  components: {
    AppBreadcrumb,
    VerticalNavMenuLink,
    VerticalNavMenuHeader,
    VerticalNavMenuGroup,
  },
  data() {
    return {
      drawer: null,
      navigationItems,
    }
  },
  computed: {
    logoUrl() {
      return `${new URL('../../../../logo.png', import.meta.url).href}`
    },
  },
  methods: {
    ...mapActions(useUserStore, ['UPDATE_USER_DATA']),
    resolveNavItemComponent,
    Logout() {
      jwt.logout()
      this.UPDATE_USER_DATA(null)
      this.$socket.disconnect()
      this.$router.push({ name: 'auth-login' })
    },
    openPasswordChange() {
      this.$q
        .dialog({
          component: PasswordChange,
          componentProps: {
            title: this.$i18n.t('components.general.changePasswordHeader'),
            message: this.$i18n.t('components.general.changePasswordMsg'),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(res => {
          this.tryPasswordChange(res.input)
        })
    },
    tryPasswordChange(newPw) {
      this.$axios
        .patch(`/api/users/password/change`, { password: newPw })
        .then(r => {
          const resCode = r.data.resCode

          if (!resCode) {
            const resMsg = r.data.resMsg
            this.$q.notify({
              message: this.$i18n.t('general.error'),
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
              caption: this.$i18n.t(`components.general.msg.error.${resMsg}`, {
                name: this.item.name,
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
  },
}
</script>

<style lang="scss">
.brand-logo img {
  height: 36px;
  width: 36px;
}

.brand-text {
  color: var(--q-primary);
  font-weight: 600;
  letter-spacing: 0.01rem;
  font-size: 1.45rem;
}
</style>
