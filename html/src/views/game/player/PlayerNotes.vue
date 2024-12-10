<template>
  <div class="row q-mb-md">
    <div class="col-12 q-px-sm">
      <q-card class="bg-secondary q-mt-sm q-pa-md full-height">
        <q-editor
          v-model="note"
          min-height="56vh"
          content-class="bg-dark text-main"
          toolbar-bg="dark"
          toolbar-toggle-color="primary"
          toolbar-color="sub"
          toolbar-text-color="sub"
          square
        />
        <q-btn
          text-color="main"
          color="primary"
          @click="trySaveNotes"
          :label="$t('general.save')"
          class="q-mt-md"
        />
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerNotes',
  data() {
    return { note: '' }
  },
  methods: {
    trySaveNotes() {
      this.$axios
        .post(`/api/players/${this.$route.params.citizenid}/notes`, {
          note: this.note,
        })
        .then(r => {
          const resCode = r.data.resCode

          if (!resCode) {
            this.$q.notify({
              message: 'Error',
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
              caption: this.$i18n.t(
                `components.player.msg.error.${r.data.resMsg}`
              ),
            })
            return
          }

          this.$q.notify({
            message: this.$i18n.t('general.success'),
            position: 'top',
            color: 'green',
            icon: 'fas fa-check',
            caption: this.$i18n.t('general.saved'),
          })
        })
    },
  },
  async mounted() {
    await this.$axios.get(`/api/players/${this.$route.params.citizenid}/notes`).then(r => {
      const note = r.data.note
      const resCode = r.data.resCode

      if (!note && !resCode) {
        this.$q.notify({
          message: 'Error',
          position: 'top',
          color: 'red',
          icon: 'fas fa-exclamation-triangle',
          caption: this.$i18n.t('components.player.msg.error.fetchingNotes'),
        })
        return
      }

      this.note = note ? note : ''
    })
  },
}
</script>
