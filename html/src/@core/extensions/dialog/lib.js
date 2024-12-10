// https://github.com/rlemaigre/vue3-promise-dialog/blob/main

import { shallowRef } from 'vue'

export const dialogRef = shallowRef()

export function closeDialog(data) {
  if (data === undefined) {
    data = dialogRef.value.comp.returnValue()
  }

  dialogRef.value.resolve(data)
  dialogRef.value = null
}

export function openDialog(dialog, props, wrapper = 'default') {
  return new Promise(resolve => {
    dialogRef.value = {
      dialog,
      props,
      wrapper,
      resolve,
    }
  })
}

export const PromiseDialog = {
  install: (app, options) => {
    app.config.globalProperties.$close = (comp, alternateValue) => {
      closeDialog(alternateValue)
    }
  },
}
