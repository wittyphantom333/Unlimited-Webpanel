import Transport from 'winston-transport'
import axios from 'axios'

export default class DiscordTransport extends Transport {
  static COLORS = {
    error: 14362664, // #db2828
    warn: 16497928, // #fbbd08
    info: 7563248, // #2185d0
    verbose: 6559689, // #6435c9
    debug: 7563248, // #2185d0
    silly: 2210373, // #21ba45
  }

  constructor(opts) {
    super(opts)
    this.webhook = opts.webhook
    this.defaultMeta = opts.defaultMeta
  }

  log(info, callback) {
    if (info.discord !== false) {
      this.sendToDiscord(info).catch(err => {
        console.log('Error sending message to discord', err)
      })
    }

    callback()
  }

  sendToDiscord = async info => {
    const postBody = {
      content: undefined,
      embeds: [
        {
          description: info.message,
          color: DiscordTransport.COLORS[info.level],
          fields: [],
          timestamp: new Date().toISOString(),
        },
      ],
    }

    if (info.level === 'error' && info.error && info.error.stack) {
      postBody.content = `\`\`\`${info.error.stack}\`\`\``
    }

    if (this.defaultMeta) {
      Object.keys(this.defaultMeta).forEach(key => {
        postBody.embeds[0].fields.push({
          name: key,
          value: this.defaultMeta[key],
        })
      })
    }

    if (info.meta) {
      Object.keys(info.meta).forEach(key => {
        postBody.embeds[0].fields.push({
          name: key,
          value: info.meta[key],
        })
      })
    }

    try {
      axios.post(this.webhook, postBody)
    } catch (err) {
      console.error('Error sending to discord')
    }
  }
}
