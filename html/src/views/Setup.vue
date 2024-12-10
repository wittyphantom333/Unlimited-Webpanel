<template>
  <div class="absolute-center" style="min-width: 50%">
    <q-stepper
      ref="stepper"
      v-model="step"
      vertical
      class="bg-secondary"
      color="secondary"
      animated
      done-color="primary"
      active-color="primary"
      inactive-color="sub"
    >
      <!--    Welcome Step   -->
      <q-step
        :name="1"
        :title="$t('components.setup.welcomeHeader')"
        icon="fas fa-language"
        :done="step > 1"
      >
        {{ $t('components.setup.welcomeSub') }}

        <q-stepper-navigation>
          <q-btn
            text-color="main"
            @click="step = 2"
            color="primary"
            :label="$t('components.setup.nextButton')"
          />
        </q-stepper-navigation>
      </q-step>

      <!--    Language Selection    -->
      <q-step
        :name="2"
        :title="$t('components.setup.langHeader')"
        icon="fas fa-flag"
        :done="step > 2"
      >
        {{ $t('components.setup.langSub') }}

        <q-select
          color="primary"
          label-color="main"
          v-model="$i18n.locale"
          class="q-my-md"
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

        <q-stepper-navigation>
          <q-btn
            text-color="main"
            @click="step = 3"
            color="primary"
            :label="$t('components.setup.nextButton')"
          />
          <q-btn
            text-color="main"
            flat
            @click="step = 1"
            color="primary"
            :label="$t('components.setup.backButton')"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>

      <!--    Master Account Step    -->
      <q-step
        :name="3"
        :title="$t('components.setup.masterHeader')"
        icon="fas fa-user"
        :done="step > 3"
      >
        {{ $t('components.setup.masterSub') }}

        <q-form ref="masterForm">
          <div class="row">
            <div class="col-12 col-md-6">
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                class="q-mt-md q-mb-sm"
                filled
                v-model="config.username"
                :label="$t(`general.username`)"
                lazy-rules
                :rules="[
                  val => (val && val.length > 0) || $t('rules.required'),
                ]"
              />
            </div>
          </div>

          <div class="row">
            <div class="col-12 col-md-6">
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                :label="$t(`general.password`)"
                v-model="config.password"
                filled
                lazy-rules
                :type="isPwd ? 'password' : 'text'"
                :rules="Required"
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer text-primary"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                label-color="primary"
                :input-style="{ color: 'var(--q-main)' }"
                class="q-ml-sm"
                filled
                v-model="passwordCon"
                :label="$t(`general.confirmPassword`)"
                lazy-rules
                :type="isPwd ? 'password' : 'text'"
                :rules="ConfirmPWD"
              />
            </div>
          </div>

          <q-stepper-navigation>
            <q-btn
              text-color="main"
              @click="validateMaster"
              color="primary"
              :label="$t('components.setup.nextButton')"
            />
            <q-btn
              text-color="main"
              flat
              @click="step = 2"
              color="primary"
              :label="$t('components.setup.backButton')"
              class="q-ml-sm"
            />
          </q-stepper-navigation>
        </q-form>
      </q-step>

      <!--    Token Step    -->
      <q-step
        :name="4"
        :title="$t('components.setup.tokenHeader')"
        icon="fas fa-key"
      >
        {{ $t('components.setup.tokenSub') }}

        <q-form ref="tokenForm">
          <q-input
            label-color="primary"
            :input-style="{ color: 'var(--q-main)' }"
            class="q-mt-md"
            filled
            v-model="config.token"
            :label="$t('general.setupToken')"
            lazy-rules
            :rules="Required"
          />
        </q-form>

        <q-stepper-navigation>
          <q-btn
            text-color="main"
            @click="formSubmitted"
            color="primary"
            :label="$t('components.setup.finishButton')"
          />
          <q-btn
            text-color="main"
            flat
            @click="step = 3"
            color="primary"
            :label="$t('components.setup.backButton')"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>

<script>
import qs from 'qs'
import { useAppStore } from '@stores/app'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'Setup',
  data() {
    return {
      config: {
        language: null,
        username: null,
        password: null,
        token: null,
      },
      passwordCon: null,
      isPwd: true,
      step: 1,
    }
  },
  computed: {
    ...mapState(useAppStore, ['setupMode']),
    ConfirmPWD() {
      return [
        v => !!v || this.$t('rules.required'),
        v => v === this.config.password || this.$t('rules.passwordConfirm'),
      ]
    },
    Required() {
      return [v => !!v || this.$t('rules.required')]
    },
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
          label: this.$t('general.languages.nl'),
          value: 'nl',
          icon: 'nl.png',
        },
        {
          label: this.$t('general.languages.no'),
          value: 'no',
          icon: 'no.png',
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
    ...mapActions(useAppStore, ['UPDATE_SETUP_MODE']),
    getFlagUrl(icon) {
      return new URL(
        `../@core/assets/flags/${icon}`,
        import.meta.url
      ).toString()
    },
    validateMaster() {
      this.$refs.masterForm.validate().then(success => {
        if (success) this.step = 4
      })
    },
    formSubmitted() {
      this.$refs.tokenForm.validate().then(success => {
        if (success) {
          this.config.language = this.$i18n.locale
          const params = qs.stringify(this.config)
          this.$axios
            .post('/setup', params)
            .then(r => {
              if (r.data.status === 'error') {
                this.$q.notify({
                  message: r.data.msg,
                  position: 'top',
                  color: 'red',
                  icon: 'fas fa-exclamation-triangle',
                  caption: r.data.title,
                })

                return
              }

              this.UPDATE_SETUP_MODE(false)

              this.$router.push('/login')
            })
            .catch(e => {
              console.error(e)
            })
        }
      })
    },
  },
  mounted() {
    if (!this.setupMode) this.$router.push('/')
  },
}
</script>

<style scoped></style>
