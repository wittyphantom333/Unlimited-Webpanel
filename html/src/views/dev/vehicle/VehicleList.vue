<template>
  <div v-if="$route.name === 'dev-vehicle-list'" class="row q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row flex-center">
            <div class="text-caption text-grey">
              {{ $t('components.devVehicleList.subheader') }}
            </div>
            <div class="q-ml-auto">
              <q-btn
                v-if="can(ACTION.DEV.VEHICLE.CREATE, RESOURCE.DEV)"
                color="primary"
                @click="$router.push({ name: 'dev-vehicle-create' })"
                :label="$t('components.devVehicleList.createVehicle')"
                class="q-ma-sm"
              />
            </div>
          </div>
          <q-separator></q-separator>
          <q-table
            color="primary"
            card-class="bg-secondary text-white"
            table-class="text-white"
            table-header-class="text-primary"
            flat
            :rows="vehicles"
            :columns="columns"
            row-key="name"
            :pagination="pagination"
            :rows-per-page-options="[0, 25, 50, 100]"
            :no-results-label="$t('components.devVehicleList.noData')"
            :loading-label="$t('components.devVehicleList.loadData')"
            :loading="loading"
            :filter="searchFilter"
            :pagination-label="getPaginationLabel"
            :rows-per-page-label="`${$t(
              'components.devVehicleList.recordsPerPage'
            )}:`"
            @update:pagination="updatePagination"
          >
            <template v-slot:top-right>
              <q-input
                :input-style="{ color: 'white' }"
                borderless
                dense
                debounce="300"
                v-model="searchFilter"
                :placeholder="$t('general.search')"
              >
                <template v-slot:append>
                  <q-icon class="text-white" name="search" />
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
                <q-td key="brand" :props="props">
                  {{ props.row.brand }}
                </q-td>
                <q-td key="model" :props="props">
                  {{ props.row.model }}
                </q-td>
                <q-td key="hash" :props="props">
                  {{ props.row.hash }}
                </q-td>
                <q-td key="price" :props="props">
                  {{ props.row.price }}
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
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
  name: 'VehicleList',
  data() {
    return {
      ACTION,
      RESOURCE,
      vehicles: [],
      columns: [
        {
          name: 'name',
          align: 'left',
          label: this.$i18n.t('components.devVehicleList.headers.name'),
          field: row => row.name,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'brand',
          align: 'left',
          label: this.$i18n.t('components.devVehicleList.headers.brand'),
          field: row => row.brand,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'model',
          align: 'left',
          label: this.$i18n.t('components.devVehicleList.headers.model'),
          field: row => row.model,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'hash',
          align: 'left',
          label: this.$i18n.t('components.devVehicleList.headers.hash'),
          field: row => row.hash,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'price',
          align: 'center',
          label: this.$i18n.t('components.devVehicleList.headers.price'),
          field: row => row.price,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'category',
          align: 'left',
          label: this.$i18n.t('components.devVehicleList.headers.category'),
          field: row => row.category,
          format: val => `${val}`,
          sortable: true,
        },
      ],
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 25,
      },
      loading: true,
    }
  },
  computed: {
    ...mapWritableState(useListsStore, ['searchFilter', 'paginationSave']),
  },
  methods: {
    can,
    onRowClick(row) {
      this.$router.push({
        name: 'dev-vehicle-detail',
        params: { vehicleId: row.key },
      })
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.devVehicleList.paginationLabel', {
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
  mounted() {
    if (this.$route.name === 'dev-vehicle-list')
      this.$axios
        .get('/api/dev-vehicles')
        .then(r => {
          for (const [key, value] of Object.entries(r.data.vehicles)) {
            this.vehicles.push({ key: key, ...value })
          }
          this.loading = false
          this.pagination = { ...this.paginationSave }
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
}
</script>

<style scoped></style>
