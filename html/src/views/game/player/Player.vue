<template>
  <div class="row" v-if="$route.name !== 'game-player-inventory'">
    <div class="col-12">
      <div class="row">
        <q-card class="q-ma-sm bg-secondary row" style="width: 100%">
          <q-card-section class="col-12">
            <div class="text-h6">
              <span class="text-primary">{{ playerName }}</span>
            </div>
          </q-card-section>
          <q-card-section class="col-12">
            <q-tabs
              v-model="activeTab"
              class="text-main full-width row"
              indicator-color="primary"
              active-color="primary"
            >
              <q-tab
                v-for="tab in playerTabs"
                :key="tab.name"
                :name="tab.name"
                :icon="tab.icon"
                :label="tab.label"
              />
            </q-tabs>
          </q-card-section>
        </q-card>
        <q-tab-panels
          v-model="activeTab"
          animated
          transition-prev="fade"
          transition-next="fade"
          class="full-width bg-transparent"
        >
          <q-tab-panel
            v-for="tab in playerTabs"
            :key="tab.name + '_panel'"
            :name="tab.name"
            class="overflow-hidden q-pa-none"
          >
            <component
              :is="tab.component"
              @updatePlayerName="playerName = $event"
            />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
    <div class="col-12">
      <div class="q-ma-sm row justify-end">
        <q-btn
          text-color="main"
          color="primary"
          @click="$router.push({ name: 'game-player-list' })"
          :label="$t('general.back')"
          class="q-mr-auto"
        />
      </div>
    </div>
  </div>
  <router-view v-else></router-view>
</template>

<script>
import PlayerGeneral from '@/views/game/player/PlayerGeneral'
import PlayerLogs from '@/views/game/player/PlayerLogs'
import PlayerVehicles from '@/views/game/player/PlayerVehicles'
import PlayerHouses from '@/views/game/player/PlayerHouses'
import PlayerNotes from '@/views/game/player/PlayerNotes'

export default {
  name: 'Player',
  components: {
    PlayerGeneral,
    PlayerVehicles,
    PlayerHouses,
    PlayerLogs,
    PlayerNotes,
  },
  data() {
    return {
      playerName: null,
      activeTab: 'general',
      playerTabs: [
        {
          name: 'general',
          icon: 'account_circle',
          label: this.$i18n.t('components.player.tabs.general'),
          component: 'player-general',
        },
        {
          name: 'vehicles',
          icon: 'directions_car',
          label: this.$i18n.t('components.player.tabs.vehicles'),
          component: 'player-vehicles',
        },
        {
          name: 'houses',
          icon: 'house',
          label: this.$i18n.t('components.player.tabs.houses'),
          component: 'player-houses',
        },
        {
          name: 'logs',
          icon: 'description',
          label: this.$i18n.t('components.player.tabs.logs'),
          component: 'player-logs',
        },
        {
          name: 'notes',
          icon: 'support',
          label: this.$i18n.t('components.player.tabs.notes'),
          component: 'player-notes',
        },
      ],
    }
  },
}
</script>
