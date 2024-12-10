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
          :label="$t('components.gang.name')"
          color="primary"
          label-color="primary"
          v-model="gang.name"
          emit-value
          :options="getPossibleGangs"
          :popup-content-style="{ backgroundColor: 'var(--q-secondary)' }"
          @update:model-value="changeGangSelection"
        >
          <template v-slot:selected>
            <div class="text-main">
              {{ gang.name ? gangs[gang.name].label : '' }}
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
          :label="$t('components.gang.grades')"
          color="primary"
          label-color="primary"
          v-model="gang.grade"
          :options="getPossibleGrades"
          :popup-content-style="{ backgroundColor: 'var(--q-secondary)' }"
        >
          <template v-slot:selected>
            <div class="text-main">
              {{ gang.grade }}
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
  name: 'ChangePlayerGang',
  data() {
    return {
      gang: { name: null, grade: 0 },
      gangs: null,
      getPossibleGrades: [],
    }
  },
  computed: {
    getPossibleGangs() {
      let gangArray = []
      if (this.gangs)
        for (const [key, value] of Object.entries(this.gangs)) {
          gangArray.push({ value: key, ...value })
        }

      return gangArray
    },
  },
  props: {
    title: String,
    label: String,
  },
  emits: ['ok', 'hide'],
  methods: {
    changeGangSelection() {
      let newPossibleGangs = []
      if (this.gang.name)
        for (
          let i = 0;
          i < Object.keys(this.gangs[this.gang.name].grades).length;
          i++
        ) {
          newPossibleGangs.push(i)
        }

      this.gang.grade = 0
      this.getPossibleGrades = newPossibleGangs
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
      this.$emit('ok', { gang: this.gang })
      this.hide()
    },
    onCancelClick() {
      this.hide()
    },
  },
  async mounted() {
    await this.$axios
      .get(`/api/players/change-gang`)
      .then(r => {
        const gangs = r.data.gangs

        if (!gangs) {
          this.$q.notify({
            message: 'Error',
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(
              'components.player.msg.error.failedFetchGangs'
            ),
          })
          return
        }

        this.gangs = gangs
      })
      .catch(() => {
        this.$q.notify({
          message: 'Error',
          position: 'top',
          color: 'red',
          icon: 'fas fa-exclamation-triangle',
          caption: this.$i18n.t('components.player.msg.error.failedFetchGangs'),
        })
        this.hide()
      })
  },
}
</script>
