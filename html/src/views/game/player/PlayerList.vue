<template>
  <div v-if="$route.name === 'game-player-list'" class="row q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row">
            <div class="text-caption text-sub">
              {{ $t('components.playerList.subheader') }}
            </div>
          </div>
          <q-separator></q-separator>
          <q-table
            ref="tableRef"
            color="primary"
            card-class="bg-secondary text-main"
            table-class="text-main"
            table-header-class="text-primary"
            flat
            :rows="players"
            :columns="columns"
            row-key="name"
            v-model:pagination="pagination"
            :rows-per-page-options="[0, 25, 50, 100]"
            :no-results-label="$t('components.playerList.noData')"
            :loading-label="$t('components.playerList.loadData')"
            :loading="loading"
            :filter="searchFilter"
            binary-state-sort
            :pagination-label="getPaginationLabel"
            :rows-per-page-label="`${$t(
              'components.playerList.recordsPerPage'
            )}:`"
            @request="onRequest"
            @update:pagination="updatePagination"
          >
            <template v-slot:top-right>
              <q-input
                :input-style="{ color: 'var(--q-main)' }"
                borderless
                dense
                debounce="300"
                v-model="searchFilter"
                :placeholder="$t('general.search')"
              >
                <template v-slot:append>
                  <q-icon class="text-main" name="search" />
                </template>
              </q-input>
            </template>
            <template v-slot:body="props">
              <q-tr
                :props="props"
                @click="onRowClick(props.row)"
                class="cursor-pointer"
              >
                <q-td key="firstname" :props="props">
                  {{ props.row.firstname }}
                </q-td>
                <q-td key="lastname" :props="props">
                  {{ props.row.lastname }}
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
                <q-td key="citizenid" :props="props">
                  {{ props.row.citizenid }}
                </q-td>
                <q-td key="job" :props="props">
                  {{ props.row.job }}
                </q-td>
                <q-td key="gang" :props="props">
                  {{ props.row.gang }}
                </q-td>
                <q-td key="online" :props="props">
                  <q-chip
                    size="sm"
                    :color="props.row.online ? 'positive' : 'negative'"
                    text-color="main"
                    :label="props.row.online ? 'Online' : 'Offline'"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </div>
    </q-card>
  </div>
  <router-view v-else></router-view>
</template>

<script>
import { mapWritableState } from 'pinia'
import { useListsStore } from '@stores/lists'

export default {
  name: 'PlayerList',
  data() {
    return {
      columns: [
        {
          name: 'firstname',
          align: 'left',
          label: this.$i18n.t('components.playerList.headers.firstname'),
          field: row => row.firstname,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'lastname',
          align: 'left',
          label: this.$i18n.t('components.playerList.headers.lastname'),
          field: row => row.lastname,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'name',
          align: 'left',
          label: this.$i18n.t('components.playerList.headers.name'),
          field: row => row.name,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'citizenid',
          align: 'left',
          label: this.$i18n.t('components.playerList.headers.citizenid'),
          field: row => row.citizenid,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'job',
          align: 'left',
          label: this.$i18n.t('components.playerList.headers.job'),
          field: row => row.job,
          format: val => `${val}`,
        },
        {
          name: 'gang',
          align: 'left',
          label: this.$i18n.t('components.playerList.headers.gang'),
          field: row => row.gang,
          format: val => `${val}`,
        },
        {
          name: 'online',
          align: 'center',
          label: this.$i18n.t('components.playerList.headers.online'),
          field: row => row.online,
          format: val => `${val}`,
        },
      ],
      players: [],
      pagination: {
        sortBy: 'firstname',
        descending: false,
        page: 1,
        rowsPerPage: 25,
        rowsNumber: 25,
      },
      loading: true,
    }
  },
  methods: {
    getRowsNumberCount(filter) {
      return this.$axios
        .post('/api/players/player-count', { filter: filter })
        .then(r => {
          return r.data.count
        })
    },
    fetchFromServer(startRow, count, filter, sortBy, descending) {
      return this.$axios
        .post('/api/players', {
          startRow: startRow,
          count: count,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
        })
        .then(r => {
          let players = []
          r.data.players.forEach(player => {
            const job = JSON.parse(player.job)
            const gang = JSON.parse(player.gang)
            const charinfo = JSON.parse(player.charinfo)
            players.push({
              citizenid: player?.citizenid,
              firstname: charinfo?.firstname,
              lastname: charinfo?.lastname,
              name: player?.name,
              gang: gang?.label,
              job: job?.label,
              online: player?.online,
            })
          })

          return players
        })
        .catch(e => {
          this.loading = false
          this.$q.notify({
            message: this.$i18n.t('general.error'),
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(`general.timeout`),
          })
        })
    },
    async onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter

      this.loading = true

      this.pagination.rowsNumber = await this.getRowsNumberCount(filter)
      const fetchCount =
        rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage
      const startRow = (page - 1) * rowsPerPage

      // fetch players
      const returnedData = await this.fetchFromServer(
        startRow,
        fetchCount,
        filter,
        sortBy,
        descending
      )

      // updating data/rows
      this.players.splice(0, this.players.length, ...returnedData)
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
      this.paginationSave = this.pagination
      this.loading = false
    },
    onRowClick(row) {
      this.$router.push({
        name: 'game-player-detail',
        params: { citizenid: row.citizenid },
      })
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.playerList.paginationLabel', {
        from: firstRowIndex,
        to: endRowIndex,
        total: totalRowsNumber,
      })
    },
    updatePagination(v) {
      if (this.loading) return

      this.paginationSave = v
      this.pagination = v
    },
  },
  computed: {
    ...mapWritableState(useListsStore, ['searchFilter', 'paginationSave']),
  },
  mounted() {
    if (this.$route.name === 'game-player-list') {
      this.pagination = { ...this.paginationSave }
      this.$refs.tableRef.requestServerInteraction()
    }
  },
}
</script>

<style scoped></style>
