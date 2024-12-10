<template>
  <div class="row q-mb-md">
    <div class="col-12 q-px-sm">
      <q-card class="bg-secondary q-mt-sm q-pa-md" style="height: 100%">
        <div class="q-mb-sm row items-center">
          <q-checkbox v-model="autoScroll" label="Auto Scroll" />
          <div class="text-caption q-mx-auto text-center text-sub">
            {{ $t('components.logs.loadMore') }}
          </div>
        </div>
        <div
          class="q-pa-sm log-container"
          ref="logContainer"
          @scroll="handleScroll"
        >
          <code
            style="display: block"
            v-for="(logline, index) in logs"
            :key="index"
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
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerLogs',
  data() {
    return {
      logs: [],
      threshold: 0,
      isAtTop: false,
      autoScroll: true,
      searchText: '',
    }
  },
  watch: {
    isAtTop(newVal) {
      if (newVal) {
        this.fetchLogs()
      }
    },
  },
  methods: {
    handleScroll(el) {
      this.isAtTop = el.target.scrollTop <= this.threshold
    },
    async fetchLogs() {
      await this.$axios
        .post(`/api/logs/${this.$route.params.citizenid}`, {
          fromline: this.logs[0],
        })
        .then(r => {
          const logs = r.data.logs

          if (Array.isArray(logs)) logs.forEach(line => this.logs.unshift(line))

          this.$nextTick(async () => {
            const tab = this.$refs.logContainer
            if (tab.scrollHeight === tab.clientHeight && logs.length === 50) {
              await this.fetchLogs()

              if (!this.autoScroll) return
              tab.scrollTop = tab.scrollHeight
            }
          })
        })
    },
  },
  async mounted() {
    await this.fetchLogs()

    const tab = this.$refs.logContainer
    if (!this.autoScroll) return
    tab.scrollTop = tab.scrollHeight
  },
}
</script>

<style scoped>
.log-container {
  overflow: auto;
  background: #3b4253;
  height: 56vh;
  border-top-right-radius: 4px;
  border-top-left-radius: 4px;
}
</style>
