<template>
  <div class="row q-pa-sm">
    <div class="col-12">
      <q-card class="bg-secondary full-width row">
        <div class="col-12 col-md-6">
          <q-card-section>
            <div class="text-h6 text-main">
              {{ $t('components.configuration.colorsHeader') }}
            </div>
            <div class="text-caption text-sub">
              {{ $t('components.configuration.colorsSub') }}
            </div>
          </q-card-section>
          <q-card-section class="row">
            <q-input
              filled
              v-model="color.value"
              v-for="(color, name) in colors"
              :key="name"
              label-color="primary"
              :label="$t(`components.configuration.colors.${name}`)"
              :input-style="{ color: 'var(--q-main)' }"
              class="q-ma-sm"
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer" color="primary">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-color
                      v-model="color.value"
                      @update:model-value="changeColor(name, color.value)"
                      class="bg-secondary"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>
          <q-card-section>
            <q-btn
              text-color="main"
              v-if="canUndo"
              color="primary"
              @click="undoColorChange"
              :label="$t('components.configuration.buttons.undo')"
            />
            <q-btn
              text-color="main"
              color="primary"
              @click="defaultColors"
              :class="{ 'q-ml-md': canUndo }"
              :label="$t('components.configuration.buttons.defaults')"
            />
          </q-card-section>
        </div>
        <div class="col-12 col-md-6">
          <q-card-section>
            <div class="text-h6 text-main">
              {{ $t('components.setup.langHeader') }}
            </div>
            <div class="text-caption text-sub">
              {{ $t('components.setup.langSub') }}
            </div>
          </q-card-section>
          <q-card-section>
            <q-select
              color="primary"
              label-color="main"
              v-model="$i18n.locale"
              emit-value
              :options="languages"
              :popup-content-style="{ backgroundColor: 'var(--q-secondary)' }"
            >
              <template v-slot:selected>
                <div class="text-main">
                  {{ $t(`general.languages.${$i18n.locale}`) }}
                </div>
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-img
                      :src="getFlagUrl(scope.opt.icon)"
                      spinner-color="primary"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-main">{{
                      scope.opt.label
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>
        </div>

        <div class="col-12 col-md-6">
          <q-card-section>
            <div class="text-h6 text-main">
              {{ $t('components.configuration.fixSupStashItemsHeader') }}
            </div>
            <div class="text-caption text-sub">
              {{ $t('components.configuration.fixSupStashItemsSub') }}
            </div>
          </q-card-section>
          <q-card-section>
            <q-btn
              text-color="main"
              color="primary"
              @click="tryFixItems"
              :label="$t('components.configuration.buttons.fixSupStashItems')"
              class="q-ml-md"
            />
          </q-card-section>
        </div>
      </q-card>
    </div>
    <div class="col-12">
      <div class="q-mt-md row justify-end">
        <q-btn
          :disable="pendingSave"
          text-color="main"
          color="primary"
          @click="trySave"
          :label="$t('general.save')"
          class="q-ml-md"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { setCssVar, getCssVar } from 'quasar'

export default {
  name: 'Configuration',
  data() {
    return {
      pendingSave: false,
      canUndo: false,
      colorNames: [
        'primary',
        'secondary',
        'main',
        'sub',
        'accent',
        'dark',
        'positive',
        'negative',
        'info',
        'warning',
      ],
      colors: {},
      lastColors: null,
      defaults: {
        primary: { value: '#7367f0' },
        secondary: { value: '#283046' },
        main: { value: '#ffffff' },
        sub: { value: '#9e9e9e' },
        accent: { value: '#03DAC6' },
        dark: { value: '#161d31' },
        positive: { value: '#4CAF50' },
        negative: { value: '#B00020' },
        info: { value: '#2196F3' },
        warning: { value: '#FB8C00' },
      },
    }
  },
  computed: {
    languages() {
      return [
        {
          label: this.$t('general.languages.de'),
          value: 'de',
          icon: 'de.png',
        },
        {
          label: this.$t('general.languages.cn'),
          value: 'cn',
          icon: 'cn.png',
        },
        {
          label: this.$t('general.languages.dk'),
          value: 'dk',
          icon: 'dk.png',
        },
        {
          label: this.$t('general.languages.en'),
          value: 'en',
          icon: 'en.png',
        },
        {
          label: this.$t('general.languages.es'),
          value: 'es',
          icon: 'es.png',
        },
        {
          label: this.$t('general.languages.et'),
          value: 'et',
          icon: 'et.png',
        },
        {
          label: this.$t('general.languages.no'),
          value: 'no',
          icon: 'no.png',
        },
        {
          label: this.$t('general.languages.nl'),
          value: 'nl',
          icon: 'nl.png',
        },
        {
          label: this.$t('general.languages.pl'),
          value: 'pl',
          icon: 'pl.png',
        },
        {
          label: this.$t('general.languages.pt'),
          value: 'pt',
          icon: 'pt.png',
        },
        {
          label: this.$t('general.languages.ta'),
          value: 'ta',
          icon: 'ta.png',
        },
        {
          label: this.$t('general.languages.tr'),
          value: 'tr',
          icon: 'tr.png',
        },
      ]
    },
  },
  methods: {
    getFlagUrl(icon) {
      return new URL(
        `../../../@core/assets/flags/${icon}`,
        import.meta.url
      ).toString()
    },
    deepClone(v) {
      return JSON.parse(JSON.stringify(v))
    },
    resetColors(cObject, undo) {
      for (const [key, color] of Object.entries(cObject)) {
        this.changeColor(key, color.value)
      }
      this.canUndo = undo
    },
    undoColorChange() {
      this.colors = this.deepClone(this.lastColors)
      this.resetColors(this.colors, false)
    },
    defaultColors() {
      this.colors = this.deepClone(this.defaults)
      this.resetColors(this.colors, true)
    },
    changeColor(name, value) {
      setCssVar(name, value)
      this.canUndo = true
    },
    async trySave() {
      this.pendingSave = true
      await this.$axios
        .post(`/api/config/update`, {
          colors: this.colors,
          lang: this.$i18n.locale,
        })
        .then(r => {
          const resCode = r.data.resCode

          if (!resCode) {
            this.$q.notify({
              message: this.$i18n.t('general.error'),
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
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

          this.pendingSave = false
          this.canUndo = false
          this.lastColors = this.deepClone(this.colors)
        })
        .catch(e => {})
    },
    async tryFixItems() {
      await this.$axios
        .post(`/api/config/fix-items`)
        .then(r => {
          const resCode = r.data.resCode

          if (!resCode) {
            this.$q.notify({
              message: this.$i18n.t('general.error'),
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
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
        .catch(e => {})
    },
  },
  mounted() {
    this.colorNames.forEach(color => {
      this.colors[color] = { value: getCssVar(color) }
    })

    this.lastColors = this.deepClone(this.colors)
  },
}
</script>

<style scoped></style>
