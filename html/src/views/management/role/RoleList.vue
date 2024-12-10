<template>
  <div v-if="$route.name === 'web-role-list'" class="row q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row flex-center">
            <div class="text-caption text-sub">
              {{ $t('components.roleList.subheader') }}
            </div>
            <div class="q-ml-auto">
              <q-btn
                text-color="main"
                v-if="can(ACTION.WEB.ROLE.CREATE, RESOURCE.WEB)"
                color="primary"
                @click="$router.push({ name: 'web-role-create' })"
                :label="$t('components.roleList.createRole')"
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
            :rows="roles"
            :columns="columns"
            row-key="name"
            :pagination="pagination"
            :rows-per-page-options="[0, 25, 50, 100]"
            :no-results-label="$t('components.roleList.noData')"
            :loading-label="$t('components.roleList.loadData')"
            :loading="loading"
            :filter="searchFilter"
            :pagination-label="getPaginationLabel"
            :rows-per-page-label="`${$t(
              'components.roleList.recordsPerPage'
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
                <q-td key="desc" :props="props">
                  {{ props.row.desc }}
                </q-td>
                <q-td key="permissions" :props="props">
                  {{ props.row.permissions.length }}
                </q-td>
                <q-td key="color" :props="props">
                  <q-badge :color="props.row.color">
                    {{ props.row.color }}
                  </q-badge>
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
  name: 'RoleList',
  data() {
    return {
      ACTION,
      RESOURCE,
      columns: [
        {
          name: 'name',
          align: 'left',
          label: this.$i18n.t('components.roleList.headers.name'),
          field: row => row.name,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'desc',
          align: 'left',
          label: this.$i18n.t('components.roleList.headers.desc'),
          field: row => row.desc,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'permissions',
          align: 'center',
          label: this.$i18n.t('components.roleList.headers.permissions'),
          field: row => row.permissions,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'color',
          align: 'center',
          label: this.$i18n.t('components.roleList.headers.color'),
          field: row => row.color,
          format: val => `${val}`,
          sortable: true,
        },
      ],
      roles: [],
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
        name: 'web-role-detail',
        params: { roleId: row.name },
      })
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.roleList.paginationLabel', {
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
    if (this.$route.name === 'web-role-list')
      this.$axios.get('/api/roles').then(r => {
        this.roles = r.data.roles
        this.loading = false
        this.pagination = { ...this.paginationSave }
      })
  },
}
</script>
