<template>
  <div v-if="$route.name === 'game-stashes-list'" class="row q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row">
            <div class="text-caption text-sub">
              {{ $t('components.stashesList.subheader') }}
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
            :rows="stashes"
            :columns="columns"
            row-key="name"
            v-model:pagination="pagination"
            :rows-per-page-options="[0, 25, 50, 100]"
            :no-results-label="$t('components.stashesList.noData')"
            :loading-label="$t('components.stashesList.loadData')"
            :loading="loading"
            :filter="searchFilter"
            binary-state-sort
            :pagination-label="getPaginationLabel"
            :rows-per-page-label="`${$t(
              'components.stashesList.recordsPerPage'
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
                <q-td key="type" :props="props">
                  {{ props.row.type }}
                </q-td>
                <q-td key="identifier" :props="props">
                  {{ props.row.identifier }}
                </q-td>
                <q-td key="item_count" :props="props">
                  {{ props.row.item_count }}
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
import { mapWritableState } from 'pinia'
import { useListsStore } from '@stores/lists'

export default {
  name: 'StashesList',
  data() {
    return {
      ACTION,
      RESOURCE,
      columns: [
        {
          name: 'type',
          align: 'left',
          label: this.$i18n.t('components.stashesList.headers.type'),
          field: row => row.type,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'identifier',
          align: 'left',
          label: this.$i18n.t('components.stashesList.headers.identifier'),
          field: row => row.identifier,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'item_count',
          align: 'center',
          label: this.$i18n.t('components.stashesList.headers.items'),
          field: row => row.item_count,
          format: val => `${val}`,
          sortable: true,
        },
      ],
      stashes: [],
      pagination: {
        sortBy: 'type',
        descending: false,
        page: 1,
        rowsPerPage: 25,
      },
      loading: true,
    }
  },
  methods: {
    getRowsNumberCount(filter) {
      return this.$axios
        .post('/api/stashes/stashes-count', { filter: filter })
        .then(r => {
          return r.data.count
        })
    },
    fetchFromServer(startRow, count, filter, sortBy, descending) {
      return this.$axios
        .post('/api/stashes', {
          startRow: startRow,
          count: count,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
        })
        .then(r => {
          return r.data.stashes
        })
        .catch(() => {
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
      this.stashes.splice(0, this.stashes.length, ...returnedData)
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
      this.paginationSave = this.pagination
      this.loading = false
    },
    onRowClick(row) {
      this.$router.push({
        name: 'game-stashes-detail',
        params: { stashId: row.identifier },
        query: { type: row.type },
      })
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.stashesList.paginationLabel', {
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
    if (this.$route.name === 'game-stashes-list') {
      this.pagination = {
        ...this.paginationSave,
        ...{ sortBy: this.pagination.sortBy },
      }
      this.$refs.tableRef.requestServerInteraction()
    }
  },
}
</script>
