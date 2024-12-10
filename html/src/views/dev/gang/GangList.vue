<template>
  <div v-if="$route.name === 'dev-gang-list'" class="row q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row flex-center">
            <div class="text-caption text-sub">
              {{ $t('components.gangList.subheader') }}
            </div>
            <div class="q-ml-auto">
              <q-btn
                text-color="main"
                v-if="can(ACTION.DEV.GANG.CREATE, RESOURCE.DEV)"
                color="primary"
                @click="$router.push({ name: 'dev-gang-create' })"
                :label="$t('components.gangList.createGang')"
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
            :rows="gangs"
            :columns="columns"
            row-key="name"
            :pagination="pagination"
            :rows-per-page-options="[0, 25, 50, 100]"
            :no-results-label="$t('components.gangList.noData')"
            :loading-label="$t('components.gangList.loadData')"
            :loading="loading"
            :filter="searchFilter"
            :pagination-label="getPaginationLabel"
            :rows-per-page-label="`${$t(
              'components.gangList.recordsPerPage'
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
                <q-td key="grades" :props="props">
                  {{ Object.keys(props.row.grades).length }}
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
  name: 'GangList',
  data() {
    return {
      ACTION,
      RESOURCE,
      gangs: [],
      columns: [
        {
          name: 'name',
          align: 'left',
          label: this.$i18n.t('components.gangList.headers.name'),
          field: row => row.name,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'label',
          align: 'left',
          label: this.$i18n.t('components.gangList.headers.label'),
          field: row => row.label,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'grades',
          align: 'center',
          label: this.$i18n.t('components.gangList.headers.grades'),
          field: row => row.grades,
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
        name: 'dev-gang-detail',
        params: { gangId: row.name },
      })
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.gangList.paginationLabel', {
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
    if (this.$route.name === 'dev-gang-list')
      this.$axios.get('/api/gangs').then(r => {
        for (const [key, value] of Object.entries(r.data.gangs)) {
          this.gangs.push({ name: key, ...value })
        }
        this.loading = false
        this.pagination = { ...this.paginationSave }
      })
  },
}
</script>

<style scoped></style>
