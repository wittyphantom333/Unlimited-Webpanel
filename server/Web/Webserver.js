import crypto from 'node:crypto'
import path from 'node:path'
import HttpClass from 'node:http'

import Koa from 'koa'
import KoaBodyParser from 'koa-bodyparser'
import KoaServe from 'koa-static'
import KoaMount from 'koa-mount'
import HistoryApiFallback from 'koa-history-api-fallback'
import KoaSession from 'koa-session'
import cors from '@koa/cors'
import MemoryStore from 'koa-session-memory'
import UnlPersistentStore from '../Utils/mysql.session.store'

import { Server as SocketIO } from 'socket.io'
import { HandleKoaSession } from '../Middleware/socketio.session.middleware'
import SocketServer from './SocketServer'
import { setHttpCallback } from '@citizenfx/http-wrapper'

import { customAlphabet } from 'nanoid'
import dict51 from 'nanoid-dictionary/nolookalikes'

import { unlEnv } from '../globalData'
import { UnlLogger } from '../Logging/UnlLogger'

import AppRouter from '../Modules/system/app/app.route'
import AuthRouter from '../Modules/system/auth/auth.route'
import ApiRouter from '../Router/api.router'
import LogWatcher from '../Logging/LogWatcher'
import { Database } from '../index'

export default class Webserver {
  constructor() {
    //Generate cookie key (name)
    const pathHash = crypto
      .createHash('shake256', { outputLength: 6 })
      .update('ServerProfilePath')
      .digest('hex')
    this.koaSessionKey = `R:UnlWeb:${pathHash}`

    this.setupKoa()
    this.setupSocketIO()
    this.setupLogWatcher()
    this.setupServerCallbacks()
  }

  setupKoa() {
    this.app = new Koa()
    this.app.proxy = true
    // session cookies
    this.app.keys = ['unlWeb' + Database.getConfigValue('tokenSecret')]

    this.koaSessionMemoryStore = unlEnv.unlMySQLSessions
      ? UnlPersistentStore
      : new MemoryStore()
    // sessionInstance for saving data
    this.sessionInstance = KoaSession(
      {
        store: this.koaSessionMemoryStore,
        key: this.koaSessionKey,
        rolling: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
      this.app
    )
    this.app.use(this.sessionInstance)

    // use cors for cross origin
    this.app.use(
      cors({
        credentials: true,
        origin: '*',
      })
    )

    const jsonLimit = '16MB'
    this.app.use(KoaBodyParser({ jsonLimit }))

    // failed jwt middleware
    this.app.use(function (ctx, next) {
      return next().catch(err => {
        if (401 === err.status) {
          ctx.body = 'Protected resource, Authorization needed\n'
          ctx.status = 401
        } else {
          throw err
        }
      })
    })

    // setup routes
    this.app.use(AppRouter.routes())
    this.app.use(AppRouter.allowedMethods())

    // auth routes
    this.app.use(AuthRouter.routes())
    this.app.use(AuthRouter.allowedMethods())

    // api routes
    this.app.use(ApiRouter.routes())
    this.app.use(ApiRouter.allowedMethods())

    // allow fallback on vue router
    this.app.use(
      HistoryApiFallback({
        verbose: false,
        rewrites: [
          {
            from: /\/assets/,
            to: function (context) {
              return (
                '/assets/' +
                context.parsedUrl.pathname.substring(
                  context.parsedUrl.pathname.lastIndexOf('/') + 1
                )
              )
            },
          },
        ],
      })
    )

    // serve client files
    if (!unlEnv.unlDisableServe)
      this.app.use(KoaServe(path.join(unlEnv.unlWebResourcePath, 'html/'), {}))

    // inventory icons
    this.app.use(
      KoaMount(
        '/public/inventory/icons',
        KoaServe(unlEnv.inventoryImagePath, {})
      )
    )

    this.koaCallback = this.app.callback()
  }

  setupSocketIO() {
    this.io = new SocketIO(HttpClass.createServer(), {
      serveClient: false,
      cors: {
        origin: '*',
      },
    })
    this.io.use(HandleKoaSession(this.app))

    this.webSocket = new SocketServer(this.io)
    this.io.on(
      'connection',
      this.webSocket.handleConnection.bind(this.webSocket)
    )

    this.io
      .of(`/${unlEnv.resourceName}`)
      .on('connection', this.webSocket.handleConnection.bind(this.webSocket))
  }

  setupLogWatcher() {
    this.logWatcher = new LogWatcher(this.webSocket)
  }

  httpCallbackHandler(source, req, res) {
    try {
      if (req.url.startsWith('/socket.io')) {
        this.io.engine.handleRequest(req, res)
      } else {
        this.koaCallback(req, res)
      }
    } catch (error) {
      // ignore socket errors
      if (req.url.startsWith('/socket.io')) return

      UnlLogger.error('Error Handling httpRequest')
    }
  }

  setupServerCallbacks() {
    try {
      setHttpCallback(this.httpCallbackHandler.bind(this, 'citizenfx'))
    } catch (error) {
      UnlLogger.error(
        `Failed to start Cfx.re Reverse Proxy Callback with error: ${error}`
      )
    }

    try {
      const listenErrorHandler = error => {
        if (error.code !== 'EADDRINUSE') return
        UnlLogger.error(
          `Failed to start HTTP server, port ${error.port} already in use.`
        )
        process.exit(1)
      }

      this.httpServer = HttpClass.createServer(
        this.httpCallbackHandler.bind(this, 'httpserver')
      )
      this.httpServer.on('error', listenErrorHandler)

      this.httpServer.listen(unlEnv.unlWebPort, '0.0.0.0', async () => {
        UnlLogger.info(`HTTP Server started on port ${unlEnv.unlWebPort}.`, {
          discord: false,
        })
      })
    } catch (error) {
      UnlLogger.error(`Failed to start HTTP server with error: ${error}.`)
    }
  }
}
