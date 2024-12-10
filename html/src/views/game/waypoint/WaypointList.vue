<template>
  <div v-if="$route.name === 'game-waypoint-list'" class="row q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row flex-center">
            <div class="text-caption text-sub">
              {{ $t('components.waypointList.subheader') }}
            </div>
            <div class="q-ml-auto">
              <q-btn
                text-color="main"
                v-if="can(ACTION.GAME.WAYPOINT.CREATE, RESOURCE.GAME)"
                color="primary"
                @click="$router.push({ name: 'game-waypoint-create' })"
                :label="$t('components.waypointList.createWaypoint')"
                class="q-ma-sm"
              />
            </div>
          </div>
          <q-separator></q-separator>
          <q-table
            color="primary"
            card-class="bg-secondary text-main"
            table-class="text-main"
            table-header-class="text-primary"
            flat
            :rows="waypoints"
            :columns="columns"
            row-key="name"
            :pagination="pagination"
            :rows-per-page-options="[0, 25, 50, 100]"
            :no-results-label="$t('components.waypointList.noData')"
            :loading-label="$t('components.waypointList.loadData')"
            :loading="loading"
            :filter="searchFilter"
            :pagination-label="getPaginationLabel"
            :rows-per-page-label="`${$t(
              'components.waypointList.recordsPerPage'
            )}:`"
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
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
                <q-td key="label" :props="props">
                  {{ props.row.label }}
                </q-td>
                <q-td key="coords" :props="props">
                  {{ props.row.coords }}
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
import { ACTION, RESOURCE } from '../../../../../common/permissions'
import { can } from '@core/layouts/utils'
import { mapWritableState } from 'pinia'
import { useListsStore } from '@stores/lists'

export default {
  name: 'WaypointMap',
  data() {
    return {
      ACTION,
      RESOURCE,
      columns: [
        {
          name: 'name',
          align: 'left',
          label: this.$i18n.t('components.waypointList.headers.name'),
          field: row => row.name,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'label',
          align: 'left',
          label: this.$i18n.t('components.waypointList.headers.label'),
          field: row => row.label,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'coords',
          align: 'left',
          label: this.$i18n.t('components.waypointList.headers.coords'),
          field: row => row.coords,
          format: val => `${val}`,
        },
      ],
      waypoints: [],
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 25,
      },
      loading: true,
    }
  },
  methods: {
    can,
    onRowClick(row) {
      this.$router.push({
        name: 'game-waypoint-detail',
        params: { waypointId: row.name },
      })
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.waypointList.paginationLabel', {
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
    if (this.$route.name === 'game-waypoint-list')
      this.$axios.get('/api/waypoints').then(r => {
        this.waypoints = r.data.waypoints
        this.loading = false
        this.pagination = { ...this.paginationSave }
      })
  },
}
</script>

<style scoped></style>
