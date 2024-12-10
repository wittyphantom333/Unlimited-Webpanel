import { createI18n } from 'vue-i18n'

function loadLocaleMessages() {
  const locales = import.meta.glob('./locales/*.json', { eager: true })
  const messages = {}
  for (const locale in locales) {
    const matched = locale.match(/([A-Za-z0-9-_]+)\./i)
    messages[matched[1]] = locales[locale]
  }

  return messages
}

export default new createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: loadLocaleMessages(),
})
