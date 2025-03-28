<template>
  <div class="col-12 col-md-6 q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row flex-center">
            <div class="text-caption text-sub">
              {{ $t('components.vehicleList.subheader') }}
            </div>
            <div class="q-ml-auto">
              <q-btn
                text-color="main"
                v-if="can(ACTION.GAME.VEHICLE.CREATE, RESOURCE.GAME)"
                color="primary"
                @click="
                  $router.push({
                    name: 'game-vehicle-create',
                    query: { citizenid: $route.params.citizenid },
                  })
                "
                :label="$t('components.vehicleList.createVehicle')"
                class="q-ma-sm"
              />
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
            :rows="vehicles"
            :columns="columns"
            row-key="name"
            v-model:pagination="pagination"
            :rows-per-page-options="[0, 25, 50, 100]"
            :no-results-label="$t('components.vehicleList.noData')"
            :loading-label="$t('components.vehicleList.loadData')"
            :loading="loading"
            :filter="filter"
            binary-state-sort
            :pagination-label="getPaginationLabel"
            :rows-per-page-label="`${$t(
              'components.vehicleList.recordsPerPage'
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
                  <q-icon class="text-main" name="search" />
                </template>
              </q-input>
            </template>
            <template v-slot:body="props">
              <q-tr
                :props="props"
                @click="onRowClick(props.row)"
                :class="
                  can(ACTION.GAME.VEHICLE.READ, RESOURCE.GAME)
                    ? 'cursor-pointer'
                    : ''
                "
              >
                <q-td key="citizenid" :props="props">
                  {{ props.row.citizenid }}
                </q-td>
                <q-td key="plate" :props="props">
                  {{ props.row.plate }}
                </q-td>
                <q-td key="vehicle" :props="props">
                  {{ props.row.vehicle }}
                </q-td>
                <q-td key="garage" :props="props">
                  {{ props.row.garage }}
                </q-td>
                <q-td key="spawned" :props="props" style="width: 50px">
                  <q-chip
                    size="sm"
                    :color="props.row.spawned ? 'positive' : 'negative'"
                    text-color="main"
                    :label="
                      props.row.spawned ? $t('general.yes') : $t('general.no')
                    "
                  />
                </q-td>
                <q-td key="state" :props="props" style="width: 50px">
                  <q-chip
                    size="sm"
                    color="primary"
                    text-color="main"
                    :label="
                      props.row.state === 0
                        ? $t('components.vehicleList.outside')
                        : props.row.state === 1
                        ? $t('components.vehicleList.garage')
                        : $t('components.vehicleList.inpound')
                    "
                  />
                </q-td>
                <q-td key="engine" :props="props" style="width: 30px">
                  {{ props.row.engine }}
                </q-td>
                <q-td key="body" :props="props" style="width: 30px">
                  {{ props.row.body }}
                </q-td>
                <q-td key="fuel" :props="props" style="width: 30px">
                  {{ props.row.fuel }}
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
import { can } from '@core/layouts/utils'
import { ACTION, RESOURCE } from '../../../../../common/permissions'

export default {
  name: 'PlayerVehicles',
  data() {
    return {
      ACTION,
      RESOURCE,
      columns: [
        {
          name: 'citizenid',
          align: 'left',
          label: this.$i18n.t('components.vehicleList.headers.owner'),
          field: row => row.citizenid,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'plate',
          align: 'left',
          label: this.$i18n.t('components.vehicleList.headers.plate'),
          field: row => row.plate,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'vehicle',
          align: 'left',
          label: this.$i18n.t('components.vehicleList.headers.vehicle'),
          field: row => row.vehicle,
          format: val => `${val}`,
        },
        {
          name: 'garage',
          align: 'left',
          label: this.$i18n.t('components.vehicleList.headers.garage'),
          field: row => row.garage,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'spawned',
          align: 'center',
          label: this.$i18n.t('components.vehicleList.headers.spawned'),
          field: row => row.spawned,
          format: val => `${val}`,
        },
        {
          name: 'state',
          align: 'center',
          label: this.$i18n.t('components.vehicleList.headers.state'),
          field: row => row.state,
          format: val => `${val}`,
        },
        {
          name: 'engine',
          align: 'center',
          label: this.$i18n.t('components.vehicleList.headers.engine'),
          field: row => row.engine,
          format: val => `${val}`,
        },
        {
          name: 'body',
          align: 'center',
          label: this.$i18n.t('components.vehicleList.headers.body'),
          field: row => row.body,
          format: val => `${val}`,
        },
        {
          name: 'fuel',
          align: 'center',
          label: this.$i18n.t('components.vehicleList.headers.fuel'),
          field: row => row.fuel,
          format: val => `${val}`,
        },
      ],
      vehicles: [],
      pagination: {
        sortBy: 'plate',
        descending: false,
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
        .post(`/api/players/${this.$route.params.citizenid}/vehicle-count`, {
          filter: filter,
        })
        .then(r => {
          return r.data.count
        })
    },
    fetchFromServer(startRow, count, filter, sortBy, descending) {
      return this.$axios
        .post(`/api/players/${this.$route.params.citizenid}/vehicles`, {
          startRow: startRow,
          count: count,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
        })
        .then(r => {
          return r.data.vehicles
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

      // fetch vehicles
      const returnedData = await this.fetchFromServer(
        startRow,
        fetchCount,
        filter,
        sortBy,
        descending
      )

      // updating data/rows
      this.vehicles.splice(0, this.vehicles.length, ...returnedData)
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
      this.loading = false
    },
    onRowClick(row) {
      if (!this.can(ACTION.GAME.VEHICLE.READ, RESOURCE.GAME)) return

      this.$router.push({
        name: 'game-vehicle-detail',
        params: { vehicleId: row.id },
      })
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.vehicleList.paginationLabel', {
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
