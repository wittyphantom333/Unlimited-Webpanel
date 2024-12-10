<template>
  <div class="row q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <q-tabs
          v-model="activeTab"
          class="text-main full-width row justify-center"
          indicator-color="primary"
          active-color="primary"
        >
          <q-tab
            v-for="tab in allowedLogTabs"
            :key="tab.name"
            :name="tab.name"
            :icon="tab.icon"
            :label="tab.label"
          />
        </q-tabs>

        <q-tab-panels
          v-model="activeTab"
          animated
          transition-prev="fade"
          transition-next="fade"
          class="full-width bg-secondary"
        >
          <q-tab-panel
            v-for="tab in allowedLogTabs"
            :key="tab.name + '_panel'"
            :name="tab.name"
            class="overflow-hidden"
          >
            <div class="q-mb-sm row items-center">
              <q-checkbox v-model="autoScroll" label="Auto Scroll" />
              <div class="text-caption q-mx-auto text-center text-sub">
                {{ $t('components.logs.loadMore') }}
              </div>
            </div>

            <div
              class="q-pa-sm log-container"
              :ref="tab.name"
              @scroll="handleScroll"
            >
              <code
                style="display: block"
                v-for="(logline, index) in filteredLogs"
                :key="`${tab.name}_${index}`"
                >{{ logline }}</code
              >
            </div>
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              dense
              class="full-width"
              square
              v-model="searchText"
              :label="$t(`general.search`)"
            />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-card>
  </div>
</template>

<script>
import { can } from '@core/layouts/utils'
import { ACTION, RESOURCE } from '../../../../../common/permissions'

export default {
  name: 'Logs',
  data() {
    return {
      ACTION,
      RESOURCE,
      threshold: 0,
      isAtTop: false,
      autoScroll: true,
      searchText: '',
      activeTab: 'unlimited',
      logTabs: [
        {
          name: 'unlimited',
          icon: 'all_inclusive',
          label: 'Unlimited',
          perm: 'READ',
        },
        { name: 'game', icon: 'sports_esports', label: 'Game', perm: 'GAME' },
        {
          name: 'player',
          icon: 'sports_martial_arts',
          label: 'Player',
          perm: 'PLAYER',
        },
        { name: 'dev', icon: 'code', label: 'Dev', perm: 'DEV' },
        { name: 'web', icon: 'language', label: 'Web', perm: 'WEB' },
      ],
      logData: {
        unlimited: [],
        game: [],
        player: [],
        dev: [],
        web: [],
      },
    }
  },
  watch: {
    isAtTop(newVal) {
      if (newVal) {
        this.fetchLogs(this.activeTab)
      }
    },
    activeTab(newTab, oldTab) {
      this.handleSocketRoom(newTab, oldTab)
    },
  },
  computed: {
    filteredLogs() {
      return this.logData[this.activeTab].filter(line =>
        line.toLowerCase().includes(this.searchText.toLowerCase())
      )
    },
    allowedLogTabs() {
      return this.logTabs.filter(tab =>
        this.can(ACTION.GAME.LOGS[tab.perm], RESOURCE.GAME)
      )
    },
  },
  methods: {
    can,
    handleScroll(el) {
      this.isAtTop = el.target.scrollTop <= this.threshold
    },
    async handleSocketRoom(newTab, oldTab = null) {
      // leave
      if (oldTab) this.$socket.emit('room::leave', `logs-${oldTab}`)
      this.logData[oldTab] = []
      // join
      await this.fetchLogs(newTab)
      const tab = this.$refs[newTab][0]
      tab.scrollTop = tab.scrollHeight
      this.$socket.emit('room::join', `logs-${newTab}`)
    },
    async fetchLogs(type) {
      await this.$axios
        .post(`/api/logs`, { type: type, fromline: this.logData[type][0] })
        .then(r => {
          const logs = r.data.logs

          if (Array.isArray(logs))
            logs.forEach(line => this.logData[this.activeTab].unshift(line))

          this.$nextTick(async () => {
            const tab = this.$refs[type][0]
            if (tab?.scrollHeight === tab?.clientHeight && logs.length === 50) {
              await this.fetchLogs(this.activeTab)

              if (!this.autoScroll) return
              tab.scrollTop = tab.scrollHeight
            }
          })
        })
    },
    updateLogs(data) {
      this.logData[data.type].push(data.newLine)
      this.$nextTick(() => {
        if (!this.autoScroll) return
        const tab = this.$refs[data.type][0]
        tab.scrollTop = tab.scrollHeight
      })
    },
  },
  async mounted() {
    await this.handleSocketRoom(this.activeTab)
    this.sockets.subscribe(`logs::update`, this.updateLogs)
    this.$socket.emit('room::join', `logs-${this.activeTab}`)
  },
  beforeUnmount() {
    this.sockets.unsubscribe('logs::update')
    this.$socket.emit('room::leave', `logs-${this.activeTab}`)
  },
}
</script>

<style scoped>
.log-container {
  overflow: auto;
  background: #3b4253;
  height: 58vh;
  border-top-right-radius: 4px;
  border-top-left-radius: 4px;
}
</style>
