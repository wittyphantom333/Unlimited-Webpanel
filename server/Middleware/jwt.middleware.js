import koaJwt from 'koa-jwt'
import { Database } from '../index'

module.exports = koaJwt({
  secret: Database.getConfigValue('tokenSecret'),
})
