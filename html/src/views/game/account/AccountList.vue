<template>
  <div v-if="$route.name === 'game-account-list'" class="row q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row">
            <div class="text-caption text-sub">
              {{ $t('components.accountList.subheader') }}
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
            :rows="accounts"
            :columns="columns"
            row-key="name"
            v-model:pagination="pagination"
            :rows-per-page-options="[0, 25, 50, 100]"
            :no-results-label="$t('components.accountList.noData')"
            :loading-label="$t('components.accountList.loadData')"
            :loading="loading"
            :filter="searchFilter"
            binary-state-sort
            :pagination-label="getPaginationLabel"
            :rows-per-page-label="`${$t(
              'components.accountList.recordsPerPage'
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
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
                <q-td key="license" :props="props">
                  {{ props.row.license }}
                </q-td>
                <q-td key="character_count" :props="props">
                  {{ props.row.character_count }}
                </q-td>
                <q-td key="last_active" :props="props">
                  {{ new Date(props.row.last_active * 1000).toLocaleString() }}
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
  name: 'AccountList',
  data() {
    return {
      columns: [
        {
          name: 'name',
          align: 'left',
          label: this.$i18n.t('components.accountList.headers.name'),
          field: row => row.name,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'license',
          align: 'left',
          label: this.$i18n.t('components.accountList.headers.license'),
          field: row => row.license,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'character_count',
          align: 'center',
          label: this.$i18n.t('components.accountList.headers.character_count'),
          field: row => row.character_count,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'last_active',
          align: 'center',
          label: this.$i18n.t('components.accountList.headers.last_active'),
          field: row => row.last_active,
          format: val => `${val}`,
          sortable: true,
        },
      ],
      accounts: [],
      pagination: {
        sortBy: 'name',
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
        .post('/api/accounts/account-count', { filter: filter })
        .then(r => {
          return r.data.count
        })
    },
    fetchFromServer(startRow, count, filter, sortBy, descending) {
      return this.$axios
        .post('/api/accounts', {
          startRow: startRow,
          count: count,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
        })
        .then(r => {
          return r.data.accounts || []
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
        .finally(() => (this.loading = false))
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
      this.accounts.splice(0, this.accounts.length, ...returnedData)
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
      this.paginationSave = this.pagination
      this.loading = false
    },
    onRowClick(row) {
      this.$router.push({
        name: 'game-account-detail',
        params: { license: row.license },
      })
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.accountList.paginationLabel', {
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
    if (this.$route.name === 'game-account-list') {
      this.pagination = { ...this.paginationSave }
      this.$refs.tableRef.requestServerInteraction()
    }
  },
}
</script>

<style scoped></style>
