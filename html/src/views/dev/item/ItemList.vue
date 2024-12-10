<template>
  <div v-if="$route.name === 'dev-item-list'" class="row q-pa-sm">
    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <div class="q-mx-md q-my-sm row flex-center">
            <div class="text-caption text-sub">
              {{ $t('components.itemList.subheader') }}
            </div>
            <div class="q-ml-auto">
              <q-btn
                text-color="main"
                v-if="can(ACTION.DEV.ITEM.CREATE, RESOURCE.DEV)"
                color="primary"
                @click="$router.push({ name: 'dev-item-create' })"
                :label="$t('components.itemList.createItem')"
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
            :rows="items"
            :columns="columns"
            row-key="name"
            :pagination="pagination"
            :rows-per-page-options="[0, 25, 50, 100]"
            :no-results-label="$t('components.itemList.noData')"
            :loading-label="$t('components.itemList.loadData')"
            :loading="loading"
            :filter="searchFilter"
            :pagination-label="getPaginationLabel"
            :rows-per-page-label="`${$t(
              'components.itemList.recordsPerPage'
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
                <q-td key="label" :props="props">
                  {{ props.row.label }}
                </q-td>
                <q-td key="type" :props="props">
                  <q-badge
                    text-color="main"
                    :color="props.row.type === 'item' ? 'primary' : 'negative'"
                  >
                    {{ props.row.type }}
                  </q-badge>
                </q-td>
                <q-td key="weight" :props="props">
                  {{ props.row.weight }}
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
                <q-td key="useable" :props="props">
                  <q-checkbox disable v-model="props.row.useable" />
                </q-td>
                <q-td key="unique" :props="props">
                  <q-checkbox disable v-model="props.row.unique" />
                </q-td>
                <q-td key="shouldClose" :props="props">
                  <q-checkbox disable v-model="props.row.shouldClose" />
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
  name: 'ItemList',
  data() {
    return {
      ACTION,
      RESOURCE,
      columns: [
        {
          name: 'label',
          align: 'left',
          label: this.$i18n.t('components.itemList.headers.label'),
          field: row => row.label,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'type',
          align: 'center',
          label: this.$i18n.t('components.itemList.headers.type'),
          field: row => row.type,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'weight',
          align: 'center',
          label: this.$i18n.t('components.itemList.headers.weight'),
          field: row => row.weight,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'name',
          required: true,
          label: this.$i18n.t('components.itemList.headers.name'),
          align: 'left',
          field: row => row.name,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'useable',
          align: 'center',
          label: this.$i18n.t('components.itemList.headers.useable'),
          field: row => row.useable,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'unique',
          align: 'center',
          label: this.$i18n.t('components.itemList.headers.unique'),
          field: row => row.unique,
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: 'shouldClose',
          align: 'center',
          label: this.$i18n.t('components.itemList.headers.shouldClose'),
          field: row => row.shouldClose,
          format: val => `${val}`,
          sortable: true,
        },
      ],
      items: [],
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
        name: 'dev-item-detail',
        params: { itemId: row.name },
      })
    },
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.itemList.paginationLabel', {
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
    if (this.$route.name === 'dev-item-list')
      this.$axios
        .get('/api/items')
        .then(r => {
          for (const [key, value] of Object.entries(r.data.items)) {
            this.items.push(value)
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
