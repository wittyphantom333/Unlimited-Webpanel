<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin bg-secondary text-main">
      <q-card-section class="row">
        <div class="text-body2" v-html="title"></div>
        <q-icon
          class="q-ml-auto cursor-pointer"
          name="close"
          @click.stop="hide"
        ></q-icon>
      </q-card-section>
      <q-card-section>
        <q-select
          :label="$t('components.job.name')"
          color="primary"
          label-color="primary"
          v-model="job.name"
          emit-value
          :options="getPossibleJobs"
          :popup-content-style="{ backgroundColor: 'var(--q-secondary)' }"
          @update:model-value="changeJobSelection"
        >
          <template v-slot:selected>
            <div class="text-main">
              {{ job.name ? jobs[job.name].label : '' }}
            </div>
          </template>

          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label class="text-main">{{
                  scope.opt.label
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-section>
        <q-select
          :label="$t('components.job.grades')"
          color="primary"
          label-color="primary"
          v-model="job.grade"
          :options="getPossibleGrades"
          :popup-content-style="{ backgroundColor: 'var(--q-secondary)' }"
        >
          <template v-slot:selected>
            <div class="text-main">
              {{ job.grade }}
            </div>
          </template>

          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label class="text-main">{{ scope.opt }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn
          text-color="main"
          color="primary"
          :label="$t('general.ok')"
          @click="onOKClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ChangePlayerJob',
  data() {
    return { job: { name: null, grade: 0 }, jobs: null, getPossibleGrades: [] }
  },
  computed: {
    getPossibleJobs() {
      let jobArray = []
      if (this.jobs)
        for (const [key, value] of Object.entries(this.jobs)) {
          jobArray.push({ value: key, ...value })
        }

      return jobArray
    },
  },
  props: {
    title: String,
    label: String,
  },
  emits: ['ok', 'hide'],
  methods: {
    changeJobSelection() {
      let newPossibleJobs = []
      if (this.job.name)
        for (
          let i = 0;
          i < Object.keys(this.jobs[this.job.name].grades).length;
          i++
        ) {
          newPossibleJobs.push(i)
        }

      this.job.grade = 0
      this.getPossibleGrades = newPossibleJobs
    },
    show() {
      this.$refs.dialog.show()
    },
    hide() {
      this.$refs.dialog.hide()
    },
    onDialogHide() {
      this.$emit('hide')
    },
    onOKClick() {
      this.$emit('ok', { job: this.job })
      this.hide()
    },
    onCancelClick() {
      this.hide()
    },
  },
  async mounted() {
    await this.$axios
      .get(`/api/players/change-job`)
      .then(r => {
        const jobs = r.data.jobs

        if (!jobs) {
          this.$q.notify({
            message: 'Error',
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(
              'components.player.msg.error.failedFetchJobs'
            ),
          })
          return
        }

        this.jobs = jobs
      })
      .catch(() => {
        this.$q.notify({
          message: 'Error',
          position: 'top',
          color: 'red',
          icon: 'fas fa-exclamation-triangle',
          caption: this.$i18n.t('components.player.msg.error.failedFetchJobs'),
        })
        this.hide()
      })
  },
}
</script>
