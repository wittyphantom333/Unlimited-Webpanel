<template>
  <div v-if="$route.name === 'game-houses-list'" class="row q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row flex-center">
            <div class="text-caption text-sub">
              {{ $t('components.housesList.subheader') }}
            </div>
          </div>
          <q-separator></q-separator>
          <q-table ref="tableRef" color="primary" card-class="bg-secondary text-main" table-class="text-main"
                   table-header-class="text-primary" flat :rows="houses" :columns="columns" row-key="name"
                   v-model:pagination="pagination" :rows-per-page-options="[0, 25, 50, 100]"
                   :no-results-label="$t('components.housesList.noData')"
                   :loading-label="$t('components.housesList.loadData')" :loading="loading" :filter="searchFilter"
                   binary-state-sort :pagination-label="getPaginationLabel" :rows-per-page-label="`${$t(
              'components.housesList.recordsPerPage'
            )}:`" @request="onRequest" @update:pagination="updatePagination">
            <template v-slot:top-right>
              <q-input :input-style="{ color: 'var(--q-main)' }" borderless dense debounce="300" v-model="searchFilter"
                       :placeholder="$t('general.search')">
                <template v-slot:append>
                  <q-icon class="text-main" name="search"/>
                </template>
              </q-input>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props" @click="onRowClick(props.row)" class="cursor-pointer">
                <q-td key="citizenid" :props="props">
                  {{ props.row.citizenid }}
                </q-td>
                <q-td key="houseName" :props="props">
                  {{ props.row.houseName }}
                </q-td>
                <q-td key="doorInside" :props="props">
                  {{ props.row.doorInside }}
                </q-td>
                <q-td key="stashName" :props="props">
                  {{ props.row.stashName }}
                </q-td>
                <q-td key="houseGarageInside" :props="props">
                  {{ props.row.houseGarageInside }}
                </q-td>
                <q-td key="price" :props="props">
                  {{ props.row.price }}
                </q-td>
                <q-td key="mlo" :props="props">
                  <q-chip
                      size="sm"
                      :color="props.row.mlo ? 'positive' : 'negative'"
                      text-color="main"
                      :label="props.row.mlo ? 'YES' : 'NO'"
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
import {ACTION, RESOURCE} from '../../../../../common/permissions'
import {can} from '@core/layouts/utils'
import {mapWritableState} from 'pinia'
import {useListsStore} from '@stores/lists'

export default {
  name: 'HouseList',
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
          name: 'doorInside',
          align: 'left',
          label: this.$i18n.t('components.housesList.headers.doorInside'),
          field: row => row.doorInside,
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
          name: 'houseGarageInside',
          align: 'left',
          label: this.$i18n.t('components.housesList.headers.houseGarageInside'),
          field: row => row.houseGarageInside,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'price',
          align: 'left',
          label: this.$i18n.t('components.housesList.headers.price'),
          field: row => row.price,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'mlo',
          align: 'left',
          label: this.$i18n.t('components.housesList.headers.mlo'),
          field: row => row.mlo,
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
    }
  },
  methods: {
    can,
    getRowsNumberCount(filter) {
      return this.$axios
          .post('/api/houses/houses-count', {filter: filter})
          .then(r => {
            return r.data.count
          })
    },
    fetchFromServer(startRow, count, filter, sortBy, descending) {
      return this.$axios
          .post('/api/houses', {
            startRow: startRow,
            count: count,
            filter: filter,
            sortBy: sortBy,
            descending: descending,
          })
          .then(r => {
            return r.data.houses
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
      this.paginationSave = this.pagination
      this.loading = false
    },
    onRowClick(row) {
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
    if (this.$route.name === 'game-houses-list') {
      this.pagination = {...this.paginationSave}
      this.$refs.tableRef.requestServerInteraction()
    }
  },
}
</script>

<style scoped></style>
