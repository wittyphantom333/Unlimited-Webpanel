<template>
  <div class="row">
    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width row">
          <q-card-section class="col-12">
            <div class="text-h6">
              {{ $t(`components.job.edit`) }}:
              <span class="text-primary">{{ $route.params.jobId }}</span>
            </div>
          </q-card-section>
          <q-card-section class="col-12 col-md-6">
            <q-input
              label-color="primary"
              :input-style="{ color: 'var(--q-main)' }"
              filled
              v-model="job.label"
              :label="$t(`components.job.label`)"
            />
          </q-card-section>
          <q-card-section class="col-12 col-md-3">
            <q-checkbox
              v-model="job.defaultDuty"
              :label="$t('components.job.defaultDuty')"
            />
          </q-card-section>
          <q-card-section class="col-12 col-md-3">
            <q-checkbox
              v-model="job.offDutyPay"
              :label="$t('components.job.offDutyPay')"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width row">
          <q-card-section class="col-12">
            <div class="row">
              <div>
                <div class="text-h6">
                  {{ $t('components.job.customVariables') }}
                </div>
                <div class="text-caption text-sub">
                  {{ $t('components.job.customVarSub') }}
                </div>
              </div>
              <div class="q-ml-auto">
                <q-btn
                  text-color="main"
                  color="primary"
                  :label="$t('components.job.addCustomVar')"
                  @click="addCustomVar"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-section class="col-12">
            <q-form ref="customVarForm">
              <q-markup-table
                class="bg-secondary text-main"
                flat
                square
                separator="none"
              >
                <tbody>
                  <tr
                    v-for="(cVar, index) in customVars"
                    :key="`${index}-customVar`"
                  >
                    <td>
                      <q-input
                        label-color="primary"
                        :input-style="{ color: 'var(--q-main)' }"
                        filled
                        v-model="cVar.name"
                        :label="$t(`components.job.customVarName`)"
                        lazy-rules
                        :rules="[
                          val =>
                            (val && val.length > 0) || $t('rules.required'),
                          val =>
                            (val && !/\s/.test(val)) || $t('rules.noSpace'),
                          val =>
                            (val &&
                              customVars.filter(v => v.name === val).length <=
                                1) ||
                            $t('rules.unique'),
                          val =>
                            (val && !defaults.includes(val.toLowerCase())) ||
                            $t('rules.defaults'),
                        ]"
                      />
                    </td>
                    <td>
                      <q-input
                        label-color="primary"
                        :input-style="{ color: 'var(--q-main)' }"
                        filled
                        class="q-field--with-bottom"
                        v-model="cVar.value"
                        :label="$t(`components.job.customVarValue`)"
                      />
                    </td>
                    <td style="width: 30px" class="text-right vertical-middle">
                      <q-btn
                        text-color="main"
                        class="text-red-6"
                        dense
                        flat
                        icon="fas fa-trash"
                        size="xs"
                        @click="removeVar(index, cVar)"
                      >
                        <q-tooltip>
                          {{ $t('general.delete') }}
                        </q-tooltip>
                      </q-btn>
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="col-12">
      <div class="q-ma-sm row">
        <q-card class="bg-secondary full-width row">
          <q-card-section class="col-12">
            <div class="row">
              <div>
                <div class="text-h6">{{ $t('components.job.grades') }}</div>
                <div class="text-caption text-sub">
                  {{ $t('components.job.gradesSub') }}
                </div>
              </div>
              <div class="q-ml-auto">
                <q-btn
                  text-color="main"
                  color="primary"
                  :label="$t('components.job.addGrade')"
                  @click="addGrade"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-section class="col-12">
            <q-markup-table
              class="bg-secondary text-main"
              flat
              square
              separator="none"
            >
              <thead>
                <tr>
                  <th class="text-left" style="width: 30px"></th>
                  <th class="text-left" style="min-width: 280px">
                    {{ $t('components.job.headers.name') }}
                  </th>
                  <th class="text-center" style="min-width: 150px">
                    {{ $t('components.job.headers.payment') }}
                  </th>
                  <th class="text-center" style="width: 30px">
                    {{ $t('components.job.headers.isboss') }}
                  </th>
                  <th class="text-right" style="width: 30px"></th>
                </tr>
              </thead>
              <draggable
                v-model="jobGrades"
                style="display: table-row-group"
                tag="tbody"
              >
                <tr
                  class="grade-table"
                  v-for="(grade, index) in jobGrades"
                  :key="`${grade.isboss}-${index}`"
                >
                  <td>
                    <q-icon name="fas fa-bars" class="drag-handle" />
                  </td>
                  <td class="text-left">
                    <q-input
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      :label="$t(`components.job.headers.name`)"
                      v-model="grade.name"
                    ></q-input>
                  </td>
                  <td class="text-left">
                    <q-input
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      type="number"
                      :label="$t(`components.job.headers.payment`)"
                      v-model.number="grade.payment"
                    ></q-input>
                  </td>
                  <td class="text-center vertical-middle">
                    <q-checkbox
                      v-on:click="updateBoss(grade, index)"
                      v-model="grade.isboss"
                    />
                  </td>
                  <td class="text-right vertical-middle">
                    <q-btn
                      text-color="main"
                      class="text-red-6"
                      dense
                      flat
                      icon="fas fa-trash"
                      size="xs"
                      @click="removeGrade(grade)"
                    >
                      <q-tooltip>
                        {{ $t('general.delete') }}
                      </q-tooltip>
                    </q-btn>
                  </td>
                </tr>
              </draggable>
            </q-markup-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="col-12">
      <div class="q-ma-sm row justify-end">
        <q-btn
          text-color="main"
          :disable="pendingDelete || pendingSave"
          color="primary"
          @click="$router.push({ name: 'dev-job-list' })"
          :label="$t('general.back')"
          class="q-mr-auto"
        />
        <q-btn
          text-color="main"
          v-if="can(ACTION.DEV.JOB.MODIFY, RESOURCE.DEV)"
          :loading="pendingSave"
          :disable="pendingDelete"
          color="primary"
          @click="trySave"
          :label="$t('general.save')"
          class="q-mr-sm"
        />
        <q-btn
          text-color="main"
          v-if="can(ACTION.DEV.JOB.DELETE, RESOURCE.DEV)"
          :loading="pendingDelete"
          :disable="pendingSave"
          color="negative"
          @click="tryDelete"
          :label="$t('general.delete')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ACTION, RESOURCE } from '../../../../../common/permissions'
import { can } from '@core/layouts/utils'
import BasicDialog from '@/components/BasicDialog'
import Sortable from 'sortablejs'
import { moveItemInArray } from '@core/extensions/move'

export default {
  name: 'Job',
  data() {
    return {
      RESOURCE,
      ACTION,
      defaults: ['name', 'grades', 'label', 'defaultduty', 'offdutypay'],
      customVars: [],
      sortable: null,
      pendingSave: false,
      pendingDelete: false,
      job: {},
      jobGrades: [],
    }
  },
  methods: {
    can,
    isNumeric(str) {
      if (typeof str != 'string') return false
      return !isNaN(str) && !isNaN(parseFloat(str))
    },
    isBoolean(str) {
      return str === 'true' || (str === 'false' ? false : str)
    },
    addCustomVar() {
      this.customVars.push({ name: '', value: '' })
    },
    removeVar(index, row) {
      if (index > -1)
        this.$q
          .dialog({
            component: BasicDialog,
            componentProps: {
              title: this.$i18n.t('components.job.deleteHeader'),
              message: this.$i18n.t('components.job.deleteCustomVarMsg', {
                name: row.name,
              }),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(() => {
            delete this.job[row.oldName]
            this.customVars.splice(index, 1)
          })
    },
    removeNode(node) {
      if (node.parentElement !== null) {
        node.parentElement.removeChild(node)
      }
    },
    insertNodeAt(fatherNode, node, position) {
      const refNode =
        position === 0
          ? fatherNode.children[0]
          : fatherNode.children[position - 1].nextSibling
      fatherNode.insertBefore(node, refNode)
    },
    buildJobGrade(input) {
      let newGrade = []

      for (const [_, value] of Object.entries(input)) {
        newGrade.push({
          name: value.name,
          payment: value.payment,
          isboss: value.isboss ? value.isboss : false,
        })
      }

      return newGrade
    },
    updateBoss(/* gradeSource, index */) {
      /*
      if (!gradeSource.isboss) return

      this.jobGrades = this.jobGrades.map(grade => {
        grade.isboss =
          grade.name === gradeSource.name &&
          index === this.jobGrades.indexOf(grade)
        return grade
      })
      */
    },
    addGrade() {
      this.jobGrades.push({ name: '', payment: 0, isboss: false })
    },
    removeGrade(row) {
      const index = this.jobGrades.indexOf(row)

      if (index > -1)
        this.$q
          .dialog({
            component: BasicDialog,
            componentProps: {
              title: this.$i18n.t('components.job.deleteHeader'),
              message: this.$i18n.t('components.job.deleteGradeMsg', {
                name: row.name,
              }),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(() => {
            this.jobGrades.splice(index, 1)
          })
    },
    trySave() {
      this.$refs.customVarForm.validate().then(unique => {
        if (!unique) {
          this.$q.notify({
            message: this.$i18n.t('general.error'),
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(`components.job.msg.error.uniqueVars`),
          })

          return
        }

        this.customVars.forEach(customVar => {
          if (!customVar.name) return
          customVar.oldName = customVar.name
          this.job[customVar.name] = this.isNumeric(customVar.value)
            ? Number(customVar.value)
            : this.isBoolean(customVar.value)
        })

        let newGrades = {}
        for (const [_, value] of Object.entries(this.jobGrades)) {
          if (!value.isboss && !value.name && !value.payment) continue
          const position = Object.keys(newGrades).length

          if (value.isboss) {
            newGrades[position] = {
              name: value.name,
              payment: value.payment,
              isboss: true,
            }
          } else {
            newGrades[position] = { name: value.name, payment: value.payment }
          }
        }

        if (Object.keys(newGrades).length === 0) {
          this.$q.notify({
            message: this.$i18n.t('general.error'),
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t(`components.job.msg.error.gradeNeeded`),
          })
          return
        }

        this.pendingSave = true

        this.job.grades = newGrades

        this.$axios
          .patch(`/api/jobs/save/${this.$route.params.jobId}`, this.job)
          .then(r => {
            this.pendingSave = false
            const resCode = r.data.resCode

            if (!resCode) {
              const resMsg = r.data.resMsg
              this.$q.notify({
                message: this.$i18n.t('general.error'),
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t(`components.job.msg.error.${resMsg}`, {
                  name: this.job.name,
                }),
              })
              return
            }

            if (Object.keys(newGrades).length !== this.jobGrades.length)
              this.jobGrades = this.buildJobGrade(this.job.grades)

            this.$q.notify({
              message: this.$i18n.t('general.success'),
              position: 'top',
              color: 'green',
              icon: 'fas fa-check',
              caption: this.$i18n.t('general.saved'),
            })
          })
          .catch(e => {})
      })
    },
    tryDelete() {
      this.pendingDelete = true

      this.$q
        .dialog({
          component: BasicDialog,
          componentProps: {
            title: this.$i18n.t('components.job.deleteHeader'),
            message: this.$i18n.t('components.job.deleteMsg', {
              name: this.$route.params.jobId,
            }),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.$axios
            .delete(`/api/jobs/delete/${this.$route.params.jobId}`)
            .then(r => {
              this.pendingDelete = false
              const resCode = r.data.resCode

              if (!resCode) {
                const resMsg = r.data.resMsg
                this.$q.notify({
                  message: this.$i18n.t('general.error'),
                  position: 'top',
                  color: 'red',
                  icon: 'fas fa-exclamation-triangle',
                  caption: this.$i18n.t(`components.job.msg.error.${resMsg}`, {
                    name: this.$route.params.jobId,
                  }),
                })
                return
              }

              this.$q.notify({
                message: this.$i18n.t('general.success'),
                position: 'top',
                color: 'green',
                icon: 'fas fa-check',
                caption: this.$i18n.t('general.deleted'),
              })
              this.$router.push({ name: 'dev-job-list' })
            })
            .catch(e => {})
        })
        .onCancel(() => {
          this.pendingDelete = false
        })
    },
  },
  mounted() {
    this.$axios
      .get(`/api/jobs/${this.$route.params.jobId}`)
      .then(r => {
        const job = r.data.job

        if (!job) {
          this.$q.notify({
            message: r.data.msg,
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: 'Error',
          })
          return
        }

        this.job = job
        this.jobGrades = this.buildJobGrade(this.job.grades)
        for (const [key, value] of Object.entries(job)) {
          if (this.defaults.includes(key.toLowerCase())) continue

          this.customVars.push({ name: key, value: value, oldName: key })
        }

        const tableBody = this.$el.querySelector('.q-table > draggable')
        const instance = this

        this.sortable = Sortable.create(tableBody, {
          handle: '.drag-handle',
          animation: 150,
          onEnd(evt) {
            if (evt.oldIndex === evt.newIndex) return

            instance.removeNode(evt.item)
            instance.insertNodeAt(evt.from, evt.item, evt.oldIndex)
            moveItemInArray(instance.jobGrades, evt.oldIndex, evt.newIndex)
          },
        })
      })
      .catch(e => {
        console.error(e)
      })
  },
  beforeUnmount() {
    this.sortable.destroy()
  },
}
</script>

<style lang="scss" scoped>
.drag-handle {
  cursor: move;
}

.q-table__middle {
  overflow-y: hidden;
  overflow-x: auto;
}
</style>
