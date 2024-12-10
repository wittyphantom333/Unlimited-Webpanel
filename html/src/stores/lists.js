import { defineStore } from 'pinia'

export const useListsStore = defineStore('lists', {
  state: () => {
    return {
      lastList: '',
      searchFilter: '',
      paginationSave: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 25,
      },
    }
  },
})
