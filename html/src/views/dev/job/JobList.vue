<template>
  <div v-if="$route.name === 'dev-job-list'" class="row q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row flex-center">
            <div class="text-caption text-sub">
              {{ $t('components.jobList.subheader') }}
            </div>
            <div class="q-ml-auto">
              <q-btn
                text-color="main"
                v-if="can(ACTION.DEV.JOB.CREATE, RESOURCE.DEV)"
                color="primary"
                @click="$router.push({ name: 'dev-job-create' })"
                :label="$t('components.jobList.createJob')"
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
            :rows="jobs"
            :columns="columns"
            row-key="name"
            :pagination="pagination"
            :rows-per-page-options="[0, 25, 50, 100]"
            :no-results-label="$t('components.jobList.noData')"
            :loading-label="$t('components.jobList.loadData')"
            :loading="loading"
            :filter="searchFilter"
            :pagination-label="getPaginationLabel"
            :rows-per-page-label="`${$t('components.jobList.recordsPerPage')}:`"
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
                <q-td key="defaultDuty" :props="props">
                  <q-checkbox disable v-model="props.row.defaultDuty" />
                </q-td>
                <q-td key="offDutyPay" :props="props">
                  <q-checkbox disable v-model="props.row.offDutyPay" />
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
  name: 'JobList',
  data() {
    return {
      ACTION,
      RESOURCE,
      jobs: [],
      columns: [
        {
          name: 'name',
          align: 'left',
          label: this.$i18n.t('components.jobList.headers.name'),
          field: row => row.name,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'label',
          align: 'left',
          label: this.$i18n.t('components.jobList.headers.label'),
          field: row => row.label,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'grades',
          align: 'center',
          label: this.$i18n.t('components.jobList.headers.grades'),
          field: row => row.grades,
          format: val => `${val}`,
          style: 'width: 30px',
          sortable: true,
        },
        {
          name: 'defaultDuty',
          align: 'center',
          label: this.$i18n.t('components.jobList.headers.defaultDuty'),
          field: row => row.defaultDuty,
          format: val => `${val}`,
          style: 'width: 30px',
          sortable: true,
        },
        {
          name: 'offDutyPay',
          align: 'center',
          label: this.$i18n.t('components.jobList.headers.offDutyPay'),
          field: row => row.offDutyPay,
          format: val => `${val}`,
          style: 'width: 30px',
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
        name: 'dev-job-detail',
        params: { jobId: row.name },
      })
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.jobList.paginationLabel', {
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
    if (this.$route.name === 'dev-job-list')
      this.$axios
        .get('/api/jobs')
        .then(r => {
          for (const [key, value] of Object.entries(r.data.jobs)) {
            this.jobs.push({ name: key, ...value })
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
