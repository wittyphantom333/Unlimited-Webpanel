<template>
  <div v-if="$route.name === 'web-user-list'" class="row q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row flex-center">
            <div class="text-caption text-sub">
              {{ $t('components.userList.subheader') }}
            </div>
            <div class="q-ml-auto">
              <q-btn
                text-color="main"
                v-if="can(ACTION.WEB.USER.CREATE, RESOURCE.WEB)"
                color="primary"
                @click="$router.push({ name: 'web-user-create' })"
                :label="$t('components.userList.createUser')"
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
            :rows="users"
            :columns="columns"
            row-key="name"
            :pagination="pagination"
            :rows-per-page-options="[0, 25, 50, 100]"
            :no-results-label="$t('components.userList.noData')"
            :loading-label="$t('components.userList.loadData')"
            :loading="loading"
            :filter="searchFilter"
            :pagination-label="getPaginationLabel"
            :rows-per-page-label="`${$t(
              'components.userList.recordsPerPage'
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
                <q-td key="role" :props="props">
                  {{ props.row.roleId }}
                </q-td>
                <q-td key="master" :props="props">
                  <q-icon
                    v-if="props.row.isMaster"
                    name="fa fa-crown"
                    color="amber"
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
import { can } from '@core/layouts/utils'
import { ACTION, RESOURCE } from '../../../../../common/permissions'
import { mapWritableState } from 'pinia'
import { useListsStore } from '@stores/lists'

export default {
  name: 'UserList',
  data() {
    return {
      ACTION,
      RESOURCE,
      columns: [
        {
          name: 'name',
          align: 'left',
          label: this.$i18n.t('components.userList.headers.name'),
          field: row => row.name,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'role',
          align: 'left',
          label: this.$i18n.t('components.userList.headers.role'),
          field: row => row.roleId,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'master',
          align: 'center',
          label: this.$i18n.t('components.userList.headers.master'),
          field: row => row.isMaster,
          format: val => `${val}`,
          sortable: true,
        },
      ],
      users: [],
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
        name: 'web-user-detail',
        params: { userId: row.name },
      })
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.userList.paginationLabel', {
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
    if (this.$route.name === 'web-user-list')
      this.$axios.get('/api/users').then(r => {
        this.users = r.data.users
        this.loading = false
        this.pagination = { ...this.paginationSave }
      })
  },
}
</script>

<style scoped></style>
