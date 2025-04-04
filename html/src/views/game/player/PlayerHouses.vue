<template>
  <div class="col-12 col-md-6 q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row flex-center">
            <div class="text-caption text-sub">
              {{ $t('components.housesList.subheader') }}
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
              :rows="houses"
              :columns="columns"
              row-key="name"
              v-model:pagination="pagination"
              :rows-per-page-options="[0, 25, 50, 100]"
              :no-results-label="$t('components.housesList.noData')"
              :loading-label="$t('components.housesList.loadData')"
              :loading="loading"
              :filter="filter"
              binary-state-sort
              :pagination-label="getPaginationLabel"
              :rows-per-page-label="`${$t(
              'components.housesList.recordsPerPage'
            )}:`"
              @request="onRequest"
          >
            <template v-slot:top-right>
              <q-input
                  :input-style="{ color: 'var(--q-main)' }"
                  borderless
                  dense
                  debounce="300"
                  v-model="filter"
                  :placeholder="$t('general.search')"
              >
                <template v-slot:append>
                  <q-icon class="text-main" name="search"/>
                </template>
              </q-input>
            </template>
            <template v-slot:body="props">
              <q-tr
                  :props="props"
                  @click="onRowClick(props.row)"
                  :class="
                  can(ACTION.GAME.HOUSES.READ, RESOURCE.GAME)
                    ? 'cursor-pointer'
                    : ''
                "
              >
                <q-td key="citizenid" :props="props">
                  {{ props.row.citizenid }}
                </q-td>
                <q-td key="houseName" :props="props">
                  {{ props.row.houseName }}
                </q-td>
                <q-td key="type" :props="props">
                  {{ props.row.type }}
                </q-td>
                <q-td key="stashName" :props="props">
                  {{ props.row.stashName }}
                </q-td>
                <q-td key="stashLevel" :props="props">
                  {{ props.row.stashLevel }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script>
import {can} from '@core/layouts/utils'
import {ACTION, RESOURCE} from '../../../../../common/permissions'

export default {
  name: 'PlayerHouses',
  data() {
    return {
      ACTION,
      RESOURCE,
      columns: [
        {
          name: 'citizenid',
          align: 'left',
          label: this.$i18n.t('components.housesList.headers.owner'),
          field: row => row.citizenid,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'houseName',
          align: 'left',
          label: this.$i18n.t('components.housesList.headers.houses'),
          field: row => row.houseName,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'type',
          align: 'left',
          label: this.$i18n.t('components.housesList.headers.type'),
          field: row => row.type,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'stashName',
          align: 'left',
          label: this.$i18n.t('components.housesList.headers.stashName'),
          field: row => row.stashName,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'stashLevel',
          align: 'left',
          label: this.$i18n.t('components.housesList.headers.stashLevel'),
          field: row => row.stashLevel,
          format: val => `${val}`,
          sortable: true,
        },
      ],
      houses: [],
      pagination: {
        sortBy: 'citizenid',
        descending: true,
        page: 1,
        rowsPerPage: 25,
      },
      loading: true,
      filter: '',
    }
  },
  methods: {
    can,
    getRowsNumberCount(filter) {
      return this.$axios
          .post(`/api/players/${this.$route.params.citizenid}/houses-count`, {
            filter: filter,
          })
          .then(r => {
            return r.data.count
          })
    },
    fetchFromServer(startRow, count, filter, sortBy, descending) {
      return this.$axios
          .post(`/api/players/${this.$route.params.citizenid}/houses`, {
            startRow: startRow,
            count: count,
            filter: filter,
            sortBy: sortBy,
            descending: descending,
          })
          .then(r => {
            return r.data.houses
          })
    },
    async onRequest(props) {
      const {page, rowsPerPage, sortBy, descending} = props.pagination
      const filter = props.filter

      this.loading = true

      this.pagination.rowsNumber = await this.getRowsNumberCount(filter)
      const fetchCount =
          rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage
      const startRow = (page - 1) * rowsPerPage

      // fetch houses
      const returnedData = await this.fetchFromServer(
          startRow,
          fetchCount,
          filter,
          sortBy,
          descending
      )

      // updating data/rows
      this.houses.splice(0, this.houses.length, ...returnedData)
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
      this.loading = false
    },
    onRowClick(row) {
      if (!this.can(ACTION.GAME.HOUSES.READ, RESOURCE.GAME)) return

      this.$router.push({
        name: 'game-houses-detail',
        params: {housesId: row.id},
      })
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.housesList.paginationLabel', {
        from: firstRowIndex,
        to: endRowIndex,
        total: totalRowsNumber,
      })
    },
  },
  mounted() {
    this.$refs.tableRef.requestServerInteraction()
  },
}
</script>

<style scoped></style>
