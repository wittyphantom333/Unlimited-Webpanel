<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card
      class="q-dialog-plugin bg-secondary text-main"
      style="width: fit-content; max-width: 1500px"
    >
      <q-card-section>
        <div class="text-h5">{{ header }}</div>
        <q-separator class="q-mt-sm"></q-separator>
      </q-card-section>
      <q-card-section>
        <q-markup-table
          class="q-mt-sm bg-secondary text-main"
          style="max-height: 50vh"
          separator="none"
          flat
          square
        >
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">
                {{ $t('components.dashboard.headers.name') }}
              </th>
              <th class="text-left">
                {{ $t('components.dashboard.headers.character') }}
              </th>
              <th class="text-left">
                {{ $t('components.dashboard.headers.rank') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(player, name) in players"
              :key="name"
              class="cursor-pointer"
              @click="onOKClick(player.citizenid)"
            >
              <td class="text-left">
                {{ player.id }}
              </td>
              <td class="text-left">
                {{ player.name }}
              </td>
              <td class="text-left">
                {{ player.charname }}
              </td>
              <td class="text-left">
                {{ player[`${type}Grade`] }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn
          text-color="main"
          color="primary"
          :label="$t('general.ok')"
          @click="onDialogHide"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'PlayersOnDutyPrompt',
  props: {
    header: String,
    players: Object,
    type: String,
  },
  emits: ['ok', 'hide'],
  methods: {
    show() {
      this.$refs.dialog.show()
    },
    hide() {
      this.$refs.dialog.hide()
    },
    onDialogHide() {
      this.$emit('hide')
    },
    onOKClick(citizenid) {
      this.$emit('ok', { citizenid: citizenid })
      this.hide()
    },
    onCancelClick() {
      this.hide()
    },
  },
}
</script>
