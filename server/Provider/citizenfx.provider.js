import crypto from 'node:crypto'
import { UnlLogger } from '../Logging/UnlLogger'
import { querystring } from '../Utils/query.params'
import request from 'superagent'
import { hostname } from 'node:os'
import { Database } from '../index'
import jwt from 'jsonwebtoken'
import { getConfig } from '../Utils/config.load'

const genCallbackURL = (ctx, provider) => {
  return GetConvar('unlServerNameURL', config.unlServerNameURL).trim() + `/auth/${provider}/callback`
}

const config = getConfig()

export default class CitizenFXProvider {
  constructor() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    })

    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  async getAuthURL(ctx, stateKern) {
    try {
      const url = new URL('https://forum.cfx.re/user-api-key/new')
      url.searchParams.append('application_name', GetConvar('unlServerName', config.unlServerName).trim())
      url.searchParams.append('client_id', hostname())
      url.searchParams.append('scopes', 'session_info')
      url.searchParams.append('public_key', this.publicKey)
      url.searchParams.append('nonce', '1')
      url.searchParams.append('auth_redirect', genCallbackURL(ctx, 'citizenfx'))

      return {
        resCode: true,
        resMsg: url,
      }
    } catch (error) {
      UnlLogger.error(error)
      return { resCode: false, resMsg: 'internal_error' }
    }
  }

  async processCallback(ctx) {
    try {
      const token = ctx.query.payload

      if (!token) {
        return { resCode: false, resMsg: 'no_token' }
      }

      const decreptedKey = crypto.privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(token, 'base64')
      )

      const json = JSON.parse(decreptedKey.toString('ascii'))

      return { resCode: true, resMsg: { accessToken: json.key } }
    } catch (error) {
      UnlLogger.error(error)
      return { resCode: false, resMsg: 'internal_error' }
    }
  }

  async getUserInfo(accessToken) {
    try {
      const { resCodeUser, resMsgUser } = await request
        .get('https://forum.cfx.re/session/current.json')
        .set('User-Api-Key', accessToken)
        .set('User-Api-Client-Id', 'Unlimited/json')
        .then(response => {
          if (response.status !== 200)
            return { resCodeUser: false, resMsgUser: 'userdata_fetch_failed' }

          // revoke key after use
          request
            .post('https://forum.cfx.re/user-api-key/revoke')
            .set('User-Api-Key', accessToken)
            .end()

          return {
            resCodeUser: true,
            resMsgUser: JSON.parse(response.text),
          }
        })

      return { resCodeUser: resCodeUser, resMsgUser: resMsgUser }
    } catch (error) {
      UnlLogger.error(error)
      return { resCodeUser: false, resMsgUser: 'internal_error' }
    }
  }

  async createSession(ctx, fxUserData) {
    try {
      const user = Database.getUserByFx(fxUserData.username)

      if (!user) {
        return { resCodeSession: false, resMsgSession: 'no_fx_user' }
      }

      const accessToken = jwt.sign(
        { userId: user.name },
        Database.getConfigValue('tokenSecret'),
        {
          expiresIn: '6h',
        }
      )
      const refreshToken = jwt.sign(
        { userId: user.name },
        Database.getConfigValue('tokenSecret'),
        {
          expiresIn: '1d',
        }
      )

      // set refreshToken/userData on session
      ctx.session.auth = {
        refreshToken: refreshToken,
        user: {
          name: user.name,
          roleId: user.roleId,
          isMaster: user.isMaster,
        },
      }

      return {
        resCodeSession: true,
        resMsgSession: { user: user, accessToken: accessToken },
      }
    } catch (error) {
      UnlLogger.error(error)
      return { resCodeSession: false, resMsgSession: 'internal_error' }
    }
  }
}
