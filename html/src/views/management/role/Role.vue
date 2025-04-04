<template>
  <div class="row">
    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width row">
          <q-card-section class="col-12">
            <div class="text-h6">
              {{ $t(`components.role.edit`) }}:
              <span class="text-primary">{{ role.name }}</span>
            </div>
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              v-model="role.desc"
              :label="$t(`components.role.desc`)"
            />
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-select
              :label="$t('components.role.color')"
              color="primary"
              label-color="primary"
              filled
              v-model="role.color"
              :options="roleColors"
              popup-content-class="bg-secondary text-main"
            >
              <template v-slot:selected>
                <q-badge :color="role.color">
                  {{ role.color }}
                </q-badge>
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label :class="`text-${scope.opt}`">{{
                      scope.opt
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width row">
          <q-card-section class="col-12">
            <div class="row">
              <div>
                <div class="text-h6">
                  {{ $t('components.role.permissions') }}
                </div>
                <div class="text-caption text-sub">
                  {{ $t('components.role.permissionSub') }}
                </div>
              </div>
              <div class="q-ml-auto">
                <q-toggle
                  left-label
                  :label="$t('general.toggleAll')"
                  v-model="toggleState"
                  color="primary"
                  @update:model-value="toggleAll"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-section class="col-12 col-md-4">
            <div class="text-subtitle1 q-mb-sm">
              {{ $t('components.role.resource.gameserver') }}
            </div>

            <div class="text-subtitle2">
              {{ $t('components.role.section.liveMap') }}
            </div>
            <q-checkbox
              v-model="permissions['game.livemap.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['game.livemap.player'].active"
              :label="$t('components.role.action.player')"
            />
            <q-checkbox
              v-model="permissions['game.livemap.vehicle'].active"
              :label="$t('components.role.action.vehicle')"
            />

            <div class="text-subtitle2">
              {{ $t('components.role.section.waypoint') }}
            </div>
            <q-checkbox
              v-model="permissions['game.waypoint.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['game.waypoint.modify'].active"
              :label="$t('components.role.action.modify')"
            />
            <q-checkbox
              v-model="permissions['game.waypoint.delete'].active"
              :label="$t('components.role.action.delete')"
            />
            <q-checkbox
              v-model="permissions['game.waypoint.create'].active"
              :label="$t('components.role.action.create')"
            />

            <div class="text-subtitle2">
              {{ $t('components.role.section.account') }}
            </div>
            <q-checkbox
              v-model="permissions['game.account.read'].active"
              :label="$t('components.role.action.read')"
            />

            <div class="text-subtitle2">
              {{ $t('components.role.section.player') }}
            </div>
            <q-checkbox
              v-model="permissions['game.player.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['game.player.modify'].active"
              :label="$t('components.role.action.modify')"
            />
            <q-checkbox
              v-model="permissions['game.player.delete'].active"
              :label="$t('components.role.action.delete')"
            />
            <q-checkbox
              v-model="permissions['game.player.license'].active"
              :label="$t('components.role.action.license')"
            />
            <q-checkbox
              v-model="permissions['game.player.job'].active"
              :label="$t('components.role.action.job')"
            />
            <q-checkbox
              v-model="permissions['game.player.gang'].active"
              :label="$t('components.role.action.gang')"
            />
            <q-checkbox
              v-model="permissions['game.player.kick'].active"
              :label="$t('components.role.action.kick')"
            />
            <q-checkbox
              v-model="permissions['game.player.warn'].active"
              :label="$t('components.role.action.warn')"
            />
            <q-checkbox
              v-model="permissions['game.player.ban'].active"
              :label="$t('components.role.action.ban')"
            />
            <q-checkbox
              v-model="permissions['game.player.money'].active"
              :label="$t('components.role.action.money')"
            />
            <q-checkbox
              v-model="permissions['game.player.meta'].active"
              :label="$t('components.role.action.meta')"
            />
            <q-checkbox
              v-model="permissions['game.player.position'].active"
              :label="$t('components.role.action.position')"
            />
            <q-checkbox
              v-model="permissions['game.player.inventory'].active"
              :label="$t('components.role.action.inventory')"
            />
            <q-checkbox
              v-model="permissions['game.player.screen'].active"
              :label="$t('components.role.action.screen')"
            />

            <div class="text-subtitle2">
              {{ $t('components.role.section.vehicles') }}
            </div>
            <q-checkbox
              v-model="permissions['game.vehicle.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['game.vehicle.modify'].active"
              :label="$t('components.role.action.modify')"
            />
            <q-checkbox
              v-model="permissions['game.vehicle.delete'].active"
              :label="$t('components.role.action.delete')"
            />
            <q-checkbox
              v-model="permissions['game.vehicle.create'].active"
              :label="$t('components.role.action.create')"
            />
            <q-checkbox
              v-model="permissions['game.vehicle.despawn'].active"
              :label="$t('components.role.action.despawn')"
            />
            <q-checkbox
              v-model="permissions['game.vehicle.repair'].active"
              :label="$t('components.role.action.repair')"
            />

            <div class="text-subtitle2">
              {{ $t('components.role.section.houses') }}
            </div>
            <q-checkbox
                v-model="permissions['game.houses.read'].active"
                :label="$t('components.role.action.read')"
            />
            <q-checkbox
                v-model="permissions['game.houses.modify'].active"
                :label="$t('components.role.action.modify')"
            />
            <q-checkbox
                v-model="permissions['game.houses.delete'].active"
                :label="$t('components.role.action.delete')"
            />

            <div class="text-subtitle2">
              {{ $t('components.role.section.stashes') }}
            </div>
            <q-checkbox
              v-model="permissions['game.stashes.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['game.stashes.modify'].active"
              :label="$t('components.role.action.modify')"
            />
            <q-checkbox
              v-model="permissions['game.stashes.delete'].active"
              :label="$t('components.role.action.delete')"
            />

            <div class="text-subtitle2">
              {{ $t('components.role.section.logs') }}
            </div>
            <q-checkbox
              v-model="permissions['game.logs.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['game.logs.game'].active"
              :label="$t('components.role.action.logs.game')"
            />
            <q-checkbox
              v-model="permissions['game.logs.player'].active"
              :label="$t('components.role.action.logs.player')"
            />
            <q-checkbox
              v-model="permissions['game.logs.dev'].active"
              :label="$t('components.role.action.logs.dev')"
            />
            <q-checkbox
              v-model="permissions['game.logs.web'].active"
              :label="$t('components.role.action.logs.web')"
            />
          </q-card-section>

          <q-card-section class="col-12 col-md-4">
            <div class="text-subtitle1 q-mb-sm">
              {{ $t('components.role.resource.development') }}
            </div>

            <div class="text-subtitle2">
              {{ $t('components.role.section.items') }}
            </div>
            <q-checkbox
              v-model="permissions['dev.item.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['dev.item.modify'].active"
              :label="$t('components.role.action.modify')"
            />
            <q-checkbox
              v-model="permissions['dev.item.delete'].active"
              :label="$t('components.role.action.delete')"
            />
            <q-checkbox
              v-model="permissions['dev.item.create'].active"
              :label="$t('components.role.action.create')"
            />

            <div class="text-subtitle2">
              {{ $t('components.role.section.jobs') }}
            </div>
            <q-checkbox
              v-model="permissions['dev.job.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['dev.job.modify'].active"
              :label="$t('components.role.action.modify')"
            />
            <q-checkbox
              v-model="permissions['dev.job.delete'].active"
              :label="$t('components.role.action.delete')"
            />
            <q-checkbox
              v-model="permissions['dev.job.create'].active"
              :label="$t('components.role.action.create')"
            />

            <div class="text-subtitle2">
              {{ $t('components.role.section.gangs') }}
            </div>
            <q-checkbox
              v-model="permissions['dev.gang.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['dev.gang.modify'].active"
              :label="$t('components.role.action.modify')"
            />
            <q-checkbox
              v-model="permissions['dev.gang.delete'].active"
              :label="$t('components.role.action.delete')"
            />
            <q-checkbox
              v-model="permissions['dev.gang.create'].active"
              :label="$t('components.role.action.create')"
            />

            <div class="text-subtitle2">
              {{ $t('components.role.section.vehicles') }}
            </div>
            <q-checkbox
              v-model="permissions['dev.vehicle.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['dev.vehicle.modify'].active"
              :label="$t('components.role.action.modify')"
            />
            <q-checkbox
              v-model="permissions['dev.vehicle.delete'].active"
              :label="$t('components.role.action.delete')"
            />
            <q-checkbox
              v-model="permissions['dev.vehicle.create'].active"
              :label="$t('components.role.action.create')"
            />
          </q-card-section>

          <q-card-section class="col-12 col-md-4">
            <div class="text-subtitle1 q-mb-sm">
              {{ $t('components.role.resource.management') }}
            </div>

            <div class="text-subtitle2">
              {{ $t('components.role.section.user') }}
            </div>
            <q-checkbox
              v-model="permissions['web.user.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['web.user.modify'].active"
              :label="$t('components.role.action.modify')"
            />
            <q-checkbox
              v-model="permissions['web.user.delete'].active"
              :label="$t('components.role.action.delete')"
            />
            <q-checkbox
              v-model="permissions['web.user.create'].active"
              :label="$t('components.role.action.create')"
            />

            <div class="text-subtitle2">
              {{ $t('components.role.section.roles') }}
            </div>
            <q-checkbox
              v-model="permissions['web.role.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['web.role.modify'].active"
              :label="$t('components.role.action.modify')"
            />
            <q-checkbox
              v-model="permissions['web.role.delete'].active"
              :label="$t('components.role.action.delete')"
            />
            <q-checkbox
              v-model="permissions['web.role.create'].active"
              :label="$t('components.role.action.create')"
            />

            <div class="text-subtitle2">
              {{ $t('components.role.section.config') }}
            </div>
            <q-checkbox
              v-model="permissions['web.config.read'].active"
              :label="$t('components.role.action.read')"
            />
            <q-checkbox
              v-model="permissions['web.config.modify'].active"
              :label="$t('components.role.action.modify')"
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
          @click="$router.push({ name: 'web-role-list' })"
          :label="$t('general.back')"
          class="q-mr-auto"
        />
        <q-btn
          text-color="main"
          v-if="can(ACTION.WEB.ROLE.MODIFY, RESOURCE.WEB)"
          :loading="pendingSave"
          :disable="pendingDelete"
          color="primary"
          @click="trySave"
          :label="$t('general.save')"
          class="q-mr-sm"
        />
        <q-btn
          text-color="main"
          v-if="can(ACTION.WEB.ROLE.DELETE, RESOURCE.WEB)"
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

export default {
  name: 'Role',
  data() {
    return {
      RESOURCE,
      ACTION,
      toggleState: false,
      pendingSave: false,
      pendingDelete: false,
      role: {},
      roleColors: [
        'red',
        'pink',
        'purple',
        'deep-purple',
        'indigo',
        'blue',
        'light-blue',
        'cyan',
        'teal',
        'green',
        'light-green',
        'lime',
        'yellow',
        'amber',
        'orange',
        'deep-orange',
        'brown',
        'grey',
        'blue-grey',
      ],
      permissions: {
        // game
        'game.livemap.read': {
          active: false,
          action: ACTION.GAME.LIVEMAP.READ,
          subject: RESOURCE.GAME,
        },
        'game.livemap.player': {
          active: false,
          action: ACTION.GAME.LIVEMAP.PLAYER,
          subject: RESOURCE.GAME,
        },
        'game.livemap.vehicle': {
          active: false,
          action: ACTION.GAME.LIVEMAP.VEHICLE,
          subject: RESOURCE.GAME,
        },
        'game.waypoint.read': {
          active: false,
          action: ACTION.GAME.WAYPOINT.READ,
          subject: RESOURCE.GAME,
        },
        'game.waypoint.modify': {
          active: false,
          action: ACTION.GAME.WAYPOINT.MODIFY,
          subject: RESOURCE.GAME,
        },
        'game.waypoint.delete': {
          active: false,
          action: ACTION.GAME.WAYPOINT.DELETE,
          subject: RESOURCE.GAME,
        },
        'game.waypoint.create': {
          active: false,
          action: ACTION.GAME.WAYPOINT.CREATE,
          subject: RESOURCE.GAME,
        },
        'game.account.read': {
          active: false,
          action: ACTION.GAME.ACCOUNT.READ,
          subject: RESOURCE.GAME,
        },
        'game.player.read': {
          active: false,
          action: ACTION.GAME.PLAYER.READ,
          subject: RESOURCE.GAME,
        },
        'game.player.modify': {
          active: false,
          action: ACTION.GAME.PLAYER.MODIFY,
          subject: RESOURCE.GAME,
        },
        'game.player.delete': {
          active: false,
          action: ACTION.GAME.PLAYER.DELETE,
          subject: RESOURCE.GAME,
        },
        'game.player.license': {
          active: false,
          action: ACTION.GAME.PLAYER.LICENSE,
          subject: RESOURCE.GAME,
        },
        'game.player.job': {
          active: false,
          action: ACTION.GAME.PLAYER.JOB,
          subject: RESOURCE.GAME,
        },
        'game.player.gang': {
          active: false,
          action: ACTION.GAME.PLAYER.GANG,
          subject: RESOURCE.GAME,
        },
        'game.player.kick': {
          active: false,
          action: ACTION.GAME.PLAYER.KICK,
          subject: RESOURCE.GAME,
        },
        'game.player.warn': {
          active: false,
          action: ACTION.GAME.PLAYER.WARN,
          subject: RESOURCE.GAME,
        },
        'game.player.ban': {
          active: false,
          action: ACTION.GAME.PLAYER.BAN,
          subject: RESOURCE.GAME,
        },
        'game.player.money': {
          active: false,
          action: ACTION.GAME.PLAYER.MONEY,
          subject: RESOURCE.GAME,
        },
        'game.player.meta': {
          active: false,
          action: ACTION.GAME.PLAYER.META,
          subject: RESOURCE.GAME,
        },
        'game.player.position': {
          active: false,
          action: ACTION.GAME.PLAYER.POSITION,
          subject: RESOURCE.GAME,
        },
        'game.player.inventory': {
          active: false,
          action: ACTION.GAME.PLAYER.INVENTORY,
          subject: RESOURCE.GAME,
        },
        'game.player.screen': {
          active: false,
          action: ACTION.GAME.PLAYER.SCREEN,
          subject: RESOURCE.GAME,
        },
        'game.vehicle.read': {
          active: false,
          action: ACTION.GAME.VEHICLE.READ,
          subject: RESOURCE.GAME,
        },
        'game.vehicle.modify': {
          active: false,
          action: ACTION.GAME.VEHICLE.MODIFY,
          subject: RESOURCE.GAME,
        },
        'game.vehicle.delete': {
          active: false,
          action: ACTION.GAME.VEHICLE.DELETE,
          subject: RESOURCE.GAME,
        },
        'game.vehicle.create': {
          active: false,
          action: ACTION.GAME.VEHICLE.CREATE,
          subject: RESOURCE.GAME,
        },
        'game.vehicle.despawn': {
          active: false,
          action: ACTION.GAME.VEHICLE.DESPAWN,
          subject: RESOURCE.GAME,
        },
        'game.vehicle.repair': {
          active: false,
          action: ACTION.GAME.VEHICLE.REPAIR,
          subject: RESOURCE.GAME,
        },
        'game.houses.read': {
          active: false,
          action: ACTION.GAME.HOUSES.READ,
          subject: RESOURCE.GAME,
        },
        'game.houses.modify': {
          active: false,
          action: ACTION.GAME.HOUSES.MODIFY,
          subject: RESOURCE.GAME,
        },
        'game.houses.delete': {
          active: false,
          action: ACTION.GAME.HOUSES.DELETE,
          subject: RESOURCE.GAME,
        },
        'game.stashes.read': {
          active: false,
          action: ACTION.GAME.STASHES.READ,
          subject: RESOURCE.GAME,
        },
        'game.stashes.modify': {
          active: false,
          action: ACTION.GAME.STASHES.MODIFY,
          subject: RESOURCE.GAME,
        },
        'game.stashes.delete': {
          active: false,
          action: ACTION.GAME.STASHES.DELETE,
          subject: RESOURCE.GAME,
        },
        'game.logs.read': {
          active: false,
          action: ACTION.GAME.LOGS.READ,
          subject: RESOURCE.GAME,
        },
        'game.logs.game': {
          active: false,
          action: ACTION.GAME.LOGS.GAME,
          subject: RESOURCE.GAME,
        },
        'game.logs.player': {
          active: false,
          action: ACTION.GAME.LOGS.PLAYER,
          subject: RESOURCE.GAME,
        },
        'game.logs.dev': {
          active: false,
          action: ACTION.GAME.LOGS.DEV,
          subject: RESOURCE.GAME,
        },
        'game.logs.web': {
          active: false,
          action: ACTION.GAME.LOGS.WEB,
          subject: RESOURCE.GAME,
        },

        // dev
        'dev.item.read': {
          active: false,
          action: ACTION.DEV.ITEM.READ,
          subject: RESOURCE.DEV,
        },
        'dev.item.modify': {
          active: false,
          action: ACTION.DEV.ITEM.MODIFY,
          subject: RESOURCE.DEV,
        },
        'dev.item.delete': {
          active: false,
          action: ACTION.DEV.ITEM.DELETE,
          subject: RESOURCE.DEV,
        },
        'dev.item.create': {
          active: false,
          action: ACTION.DEV.ITEM.CREATE,
          subject: RESOURCE.DEV,
        },
        'dev.job.read': {
          active: false,
          action: ACTION.DEV.JOB.READ,
          subject: RESOURCE.DEV,
        },
        'dev.job.modify': {
          active: false,
          action: ACTION.DEV.JOB.MODIFY,
          subject: RESOURCE.DEV,
        },
        'dev.job.delete': {
          active: false,
          action: ACTION.DEV.JOB.DELETE,
          subject: RESOURCE.DEV,
        },
        'dev.job.create': {
          active: false,
          action: ACTION.DEV.JOB.CREATE,
          subject: RESOURCE.DEV,
        },
        'dev.gang.read': {
          active: false,
          action: ACTION.DEV.GANG.READ,
          subject: RESOURCE.DEV,
        },
        'dev.gang.modify': {
          active: false,
          action: ACTION.DEV.GANG.MODIFY,
          subject: RESOURCE.DEV,
        },
        'dev.gang.delete': {
          active: false,
          action: ACTION.DEV.GANG.DELETE,
          subject: RESOURCE.DEV,
        },
        'dev.gang.create': {
          active: false,
          action: ACTION.DEV.GANG.CREATE,
          subject: RESOURCE.DEV,
        },
        'dev.vehicle.read': {
          active: false,
          action: ACTION.DEV.VEHICLE.READ,
          subject: RESOURCE.DEV,
        },
        'dev.vehicle.modify': {
          active: false,
          action: ACTION.DEV.VEHICLE.MODIFY,
          subject: RESOURCE.DEV,
        },
        'dev.vehicle.delete': {
          active: false,
          action: ACTION.DEV.VEHICLE.DELETE,
          subject: RESOURCE.DEV,
        },
        'dev.vehicle.create': {
          active: false,
          action: ACTION.DEV.VEHICLE.CREATE,
          subject: RESOURCE.DEV,
        },

        // web
        'web.user.read': {
          active: false,
          action: ACTION.WEB.USER.READ,
          subject: RESOURCE.WEB,
        },
        'web.user.modify': {
          active: false,
          action: ACTION.WEB.USER.MODIFY,
          subject: RESOURCE.WEB,
        },
        'web.user.delete': {
          active: false,
          action: ACTION.WEB.USER.DELETE,
          subject: RESOURCE.WEB,
        },
        'web.user.create': {
          active: false,
          action: ACTION.WEB.USER.CREATE,
          subject: RESOURCE.WEB,
        },
        'web.role.read': {
          active: false,
          action: ACTION.WEB.ROLE.READ,
          subject: RESOURCE.WEB,
        },
        'web.role.modify': {
          active: false,
          action: ACTION.WEB.ROLE.MODIFY,
          subject: RESOURCE.WEB,
        },
        'web.role.delete': {
          active: false,
          action: ACTION.WEB.ROLE.DELETE,
          subject: RESOURCE.WEB,
        },
        'web.role.create': {
          active: false,
          action: ACTION.WEB.ROLE.CREATE,
          subject: RESOURCE.WEB,
        },
        'web.config.read': {
          active: false,
          action: ACTION.WEB.CONFIG.READ,
          subject: RESOURCE.WEB,
        },
        'web.config.modify': {
          active: false,
          action: ACTION.WEB.CONFIG.MODIFY,
          subject: RESOURCE.WEB,
        },
      },
    }
  },
  methods: {
    can,
    toggleAll() {
      for (const [_, value] of Object.entries(this.permissions)) {
        value.active = this.toggleState
      }
    },
    trySave() {
      this.pendingSave = true
      this.role.permissions = []

      for (const [_, value] of Object.entries(this.permissions)) {
        if (value.active)
          this.role.permissions.push({
            subject: value.subject,
            action: value.action,
          })
      }

      this.$axios
        .patch(`/api/roles/save/${this.role.name}`, this.role)
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
              caption: this.$i18n.t(`components.role.msg.error.${resMsg}`, {
                name: this.role.name,
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
            title: this.$i18n.t('components.role.deleteHeader'),
            message: this.$i18n.t('components.role.deleteMsg', {
              name: this.role.name,
            }),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.$axios
            .delete(`/api/roles/delete/${this.role.name}`)
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
                  caption: this.$i18n.t(`components.role.msg.error.${resMsg}`, {
                    name: this.role.name,
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
              this.$router.push({ name: 'web-role-list' })
            })
            .catch(e => {})
        })
        .onCancel(() => {
          this.pendingDelete = false
        })
    },
  },
  mounted() {
    this.$axios
      .get(`/api/roles/${this.$route.params.roleId}`)
      .then(r => {
        const role = r.data.role

        if (!role) {
          this.$q.notify({
            message: r.data.msg,
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: 'Error',
          })
          return
        }

        this.role = role
        for (const [key, value] of Object.entries(this.permissions)) {
          const hasPerm = role.permissions.some(
            p => p.action === value.action && p.subject === value.subject
          )

          if (hasPerm) value.active = true
        }
      })
      .catch(e => {
        console.error(e)
      })
  },
}
</script>
