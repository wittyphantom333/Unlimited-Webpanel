<template>
  <div class="row">
    <div class="col-12 col-sm-6 col-md-4">
      <q-card class="q-ma-sm bg-secondary">
        <div class="row">
          <div class="col-6 column items-start">
            <q-card-section>
              <div
                class="text-h5"
                :class="{
                  'text-warning': cpu >= 60,
                  'text-negative': cpu >= 75,
                }"
              >
                {{ cpu }}%
              </div>
              <q-separator class="bg-primary q-my-xs" />
              <span class="text-sub">{{ $t('components.dashboard.cpu') }}</span>
            </q-card-section>
          </div>

          <div cols="6" class="col-6 row items-center justify-end">
            <q-icon
              class="q-mr-lg"
              color="primary"
              size="md"
              name="fas fa-microchip"
            />
          </div>
        </div>
      </q-card>
    </div>
    <div class="col-12 col-sm-6 col-md-4">
      <q-card class="q-ma-sm bg-secondary">
        <div class="row">
          <div class="col-6 column items-start">
            <q-card-section>
              <div
                class="text-h5"
                :class="{
                  'text-warning': memory >= 60 && memory < 75,
                  'text-negative': memory >= 75,
                }"
              >
                {{ memory }}%
              </div>
              <q-separator class="bg-primary q-my-xs" />
              <span class="text-sub">{{ $t('components.dashboard.ram') }}</span>
            </q-card-section>
          </div>

          <div cols="6" class="col-6 row items-center justify-end">
            <q-icon
              class="q-mr-lg"
              color="primary"
              size="md"
              name="fas fa-memory"
            />
          </div>
        </div>
      </q-card>
    </div>
    <div class="col-12 col-sm-6 col-md-4">
      <q-card class="q-ma-sm bg-secondary">
        <div class="row items-start">
          <q-card-section>
            <div class="text-h5">{{ usage }} MB</div>
            <q-separator class="bg-primary q-my-xs" />
            <span class="text-sub">{{
              $t('components.dashboard.process')
            }}</span>
          </q-card-section>
        </div>
      </q-card>
    </div>
    <div class="col-12 col-sm-6 col-md-4">
      <q-card class="q-ma-sm bg-secondary">
        <div class="row items-start">
          <q-card-section class="full-width">
            <div class="row">
              <div class="text-h5">
                {{ $t('components.dashboard.onlinePlayers') }}
              </div>
              <div class="text-h5 text-primary text-bold q-ml-auto q-mr-sm">
                {{ players.length }}
              </div>
            </div>
            <q-separator class="bg-primary q-my-xs" />
            <q-markup-table
              class="q-mt-sm bg-secondary text-main"
              style="max-height: 50vh"
              separator="none"
              flat
              square
            >
              <thead>
                <tr>
                  <th class="text-left">ID</th>
                  <th class="text-left">
                    {{ $t('components.dashboard.headers.name') }}
                  </th>
                  <th class="text-left">
                    {{ $t('components.dashboard.headers.character') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(player, name) in players"
                  :key="name"
                  class="cursor-pointer"
                  @click="
                    $router.push({
                      name: 'game-player-detail',
                      params: { citizenid: player.citizenid },
                    })
                  "
                >
                  <td class="text-left">
                    {{ player.id }}
                  </td>
                  <td class="text-left">
                    {{ player.name }}
                  </td>
                  <td class="text-left">
                    {{ player.charname }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card-section>
        </div>
      </q-card>
    </div>
    <div class="col-12 col-sm-6 col-md-4">
      <q-card class="q-ma-sm bg-secondary">
        <div class="row items-start">
          <q-card-section class="full-width">
            <div class="text-h5">{{ $t('components.dashboard.jobsDuty') }}</div>
            <q-separator class="bg-primary q-my-xs" />
            <q-markup-table
              class="q-mt-sm bg-secondary text-main"
              separator="none"
              style="max-height: 50vh"
              flat
              square
            >
              <thead>
                <tr>
                  <th class="text-left">
                    {{ $t('components.dashboard.headers.job') }}
                  </th>
                  <th class="text-left">
                    {{ $t('components.dashboard.headers.count') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="cursor-pointer"
                  v-for="(job, name) in sortedDutys"
                  :key="name"
                  @click="openJobDutyDialog(name)"
                >
                  <td class="text-left">
                    {{ name }}
                  </td>
                  <td class="text-left">
                    {{ job }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card-section>
        </div>
      </q-card>
    </div>
    <div class="col-12 col-sm-6 col-md-4">
      <q-card class="q-ma-sm bg-secondary">
        <div class="row items-start">
          <q-card-section class="full-width">
            <div class="text-h5">
              {{ $t('components.dashboard.gangOnline') }}
            </div>
            <q-separator class="bg-primary q-my-xs" />
            <q-markup-table
              class="q-mt-sm bg-secondary text-main"
              separator="none"
              style="max-height: 50vh"
              flat
              square
            >
              <thead>
                <tr>
                  <th class="text-left">
                    {{ $t('components.dashboard.headers.gang') }}
                  </th>
                  <th class="text-left">
                    {{ $t('components.dashboard.headers.count') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="cursor-pointer"
                  v-for="(gang, name) in sortedGangs"
                  :key="name"
                  @click="openGangDutyDialog(name)"
                >
                  <td class="text-left">
                    {{ name }}
                  </td>
                  <td class="text-left">
                    {{ gang }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card-section>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
import PlayersOnDutyPrompt from '@/components/PlayersOnDutyPrompt.vue'

export default {
  name: 'Dashboard',
  data: () => ({
    cpu: 0,
    memory: 0,
    usage: 0,
    jobDutys: {},
    gangsOnline: {},
    players: [],
  }),
  computed: {
    sortedDutys() {
      return Object.entries(this.jobDutys)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {})
    },
    sortedGangs() {
      return Object.entries(this.gangsOnline)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {})
    },
  },
  methods: {
    updateDashboard(data) {
      this.cpu = data.cpu
      this.memory = data.memory.usedMemPercentage
      this.usage = data.usage.toFixed(2)
      this.players = data.players
      this.jobDutys = data.jobDutys
      this.gangsOnline = data.gangsOnline
    },
    openJobDutyDialog(job) {
      const players = this.players.filter(p => p.job === job && p.duty)
      if (players.length === 0) return

      this.$q
        .dialog({
          component: PlayersOnDutyPrompt,
          componentProps: {
            header: job,
            players: players.sort((a, b) => a.jobGrade - b.jobGrade).reverse(),
            type: 'job',
          },
          cancel: false,
          persistent: false,
        })
        .onOk(data => {
          this.$router.push({
            name: 'game-player-detail',
            params: { citizenid: data.citizenid },
          })
        })
    },
    openGangDutyDialog(gang) {
      const players = this.players.filter(p => p.gang === gang)
      if (players.length === 0) return

      this.$q
        .dialog({
          component: PlayersOnDutyPrompt,
          componentProps: {
            header: gang,
            players: players
              .sort((a, b) => a.gangGrade - b.gangGrade)
              .reverse(),
            type: 'gang',
          },
          cancel: false,
          persistent: false,
        })
        .onOk(data => {
          this.$router.push({
            name: 'game-player-detail',
            params: { citizenid: data.citizenid },
          })
        })
    },
  },
  mounted() {
    this.sockets.subscribe('dashboard::update', this.updateDashboard)
    this.$socket.emit('room::join', 'dashboard')
  },
  beforeUnmount() {
    this.sockets.unsubscribe('dashboard::update')
    this.$socket.emit('room::leave', 'dashboard')
  },
}
</script>
