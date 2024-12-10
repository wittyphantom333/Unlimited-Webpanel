import { OutgoingMessage } from 'node:http'
import { UnlLogger } from '../Logging/UnlLogger'

export function HandleKoaSession(app) {
  return async function (socket, next) {
    try {
      let ctx = app.createContext(socket.request, new OutgoingMessage())

      await ctx.session._sessCtx.initFromExternal()
      socket.session = ctx.session

      if (socket.session) return await next()
    } catch (err) {
      UnlLogger.error(`Socket Middleware error: ${err}`)
    }

    UnlLogger.error('Socket Connection failed due no session.')
    socket.disconnect()
  }
}
