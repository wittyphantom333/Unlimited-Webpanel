import fs from 'node:fs'
import router from '@koa/router'
import multer from '../../../Middleware/koa.multer'
import { checkPermission } from '../../web/role/role.controller'
import { Game } from '../../../index'
import { ACTION, RESOURCE } from '../../../../common/permissions'
import { devLogger } from '../../../Logging/Modules/DevLogger'
import { UnlLogger } from '../../../Logging/UnlLogger'
import { unlEnv } from '../../../globalData'
import { deleteItemTypeFromSupportStash } from '../../../Utils/item.utils'
import { webLogger } from '../../../Logging/Modules/WebLogger'

const imageStorage = multer.diskStorage({
  destination: unlEnv.inventoryImagePath,
  filename: function (req, file, cb) {
    return cb(null, file.originalname)
  },
})
const imageLimits = {
  fields: 10,
  fileSize: 500 * 1024, // 5MB
  files: 1,
}
const fileFilter = function (req, file, callback) {
  if (fs.existsSync(path.join(unlEnv.inventoryImagePath, file.originalname))) {
    req.error = `File ${file.originalname} does already exist!`
    callback(null, false)
  } else {
    callback(null, true)
  }
}
const upload = multer({
  storage: imageStorage,
  limits: imageLimits,
  fileFilter,
}).single('file')

export const itemRouter = new router({ prefix: '/items' })

itemRouter.get(
  '/',
  checkPermission(ACTION.DEV.ITEM.READ, RESOURCE.DEV),
  async ctx => {
    devLogger.info(`${ctx.session.auth.user.name} requested all items.`)
    try {
      // toDo: implement side fetching e.g. 25 per request etc
      const items = Game.getItems()

      ctx.body = {
        items: items,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

itemRouter.get(
  '/list',
  checkPermission(ACTION.DEV.ITEM.READ, RESOURCE.DEV),
  async ctx => {
    devLogger.info(`${ctx.session.auth.user.name} requested item list.`)
    try {
      const items = Game.getItems()
      let images = []
      fs.readdirSync(unlEnv.inventoryImagePath).forEach(image => {
        images.push(image)
      })

      ctx.body = {
        items: Object.values(items).map(({ name, label }) => {
          return { value: name, label: label }
        }),
        images: images,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

itemRouter.get('/item-list', async ctx => {
  webLogger.info(`${ctx.session.auth.user.name} requested item list.`)
  try {
    const items = Game.QBCore.Shared.Items

    ctx.body = {
      items: Object.values(items).map(({ name, label, image }) => {
        return { value: name, label: label, image: image }
      }),
    }
    ctx.status = 200
  } catch (e) {
    UnlLogger.error(e)
    ctx.body = e.message
    ctx.status = 500
  }
})

itemRouter.get(
  '/:id',
  checkPermission(ACTION.DEV.ITEM.READ, RESOURCE.DEV),
  ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested item ${ctx.params.id}.`
    )
    try {
      const itemId = ctx.params.id
      const items = Game.getItems()
      const item = Game.getItem(itemId)
      let images = []
      fs.readdirSync(unlEnv.inventoryImagePath).forEach(image => {
        images.push(image)
      })

      ctx.body = {
        item: item,
        items: Object.values(items).map(({ name, label }) => {
          return { value: name, label: label }
        }),
        images: images,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

itemRouter.patch(
  '/save/:id',
  checkPermission(ACTION.DEV.ITEM.MODIFY, RESOURCE.DEV),
  async ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested save item ${ctx.params.id}.`
    )
    try {
      const itemId = ctx.params.id
      const data = ctx.request.body
      const { resCode, resMsg } = await Game.updateItem(itemId, data)

      if (resCode)
        devLogger.info(
          `${ctx.session.auth.user.name} successfully saved item ${itemId}.`
        )

      ctx.body = {
        resCode: resCode,
        resMsg: resMsg,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

itemRouter.post(
  '/create',
  checkPermission(ACTION.DEV.ITEM.CREATE, RESOURCE.DEV),
  async ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested create item ${ctx.request.body.name}.`
    )
    try {
      const data = ctx.request.body
      const { resCode, resMsg } = await Game.addItem(data.name, data)

      if (resCode)
        devLogger.info(
          `${ctx.session.auth.user.name} successfully created item ${data.name}.`
        )

      ctx.body = {
        resCode: resCode,
        resMsg: resMsg,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

itemRouter.delete(
  '/delete/:id',
  checkPermission(ACTION.DEV.ITEM.DELETE, RESOURCE.DEV),
  async ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested delete item ${ctx.params.id}.`
    )
    try {
      const itemId = ctx.params.id
      const { resCode, resMsg } = await Game.deleteItem(itemId)

      if (resCode) {
        devLogger.info(
          `${ctx.session.auth.user.name} successfully deleted item ${itemId}.`
        )
        await deleteItemTypeFromSupportStash(itemId)
      }

      ctx.body = {
        resCode: resCode,
        resMsg: resMsg,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

itemRouter.post(
  '/icon-upload',
  checkPermission(ACTION.DEV.ITEM.READ, RESOURCE.DEV),
  upload,
  async ctx => {
    try {
      ctx.status = 200
      if (ctx.req.error) {
        ctx.body = {
          resCode: false,
          resMsg: 'filename_exists',
        }
        return
      }

      devLogger.info(
        `${ctx.session.auth.user.name} uplaoded item image ${ctx.file.originalname}.`
      )

      let images = []
      fs.readdirSync(unlEnv.inventoryImagePath).forEach(image => {
        images.push(image)
      })

      ctx.body = {
        resCode: true,
        filename: ctx.file.originalname,
        images: images,
      }
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

export default itemRouter
