import Router from '@koa/router'

import JWtMiddleware from '../Middleware/jwt.middleware'

import userRouter from '../Modules/web/user/user.route'
import roleRouter from '../Modules/web/role/role.route'

import itemRouter from '../Modules/dev/item/item.route'
import gangRouter from '../Modules/dev/gang/gang.route'
import jobRouter from '../Modules/dev/job/job.route'
import playerRouter from '../Modules/game/player/player.route'
import vehicleRouter from '../Modules/game/vehicle/vehicle.route'
import logRouter from '../Modules/game/logs/logs.route'
import configRouter from '../Modules/web/config/config.router'
import devVehicleRouter from '../Modules/dev/vehicle/vehicle.route'
import waypointRouter from '../Modules/game/waypoint/waypoint.route'
import accountRouter from '../Modules/game/accounts/accounts.route'
import stashesRouter from '../Modules/game/stashes/stashes.route'
import housesRouter from "../Modules/game/houses/houses.route";

const router = new Router({ prefix: '/api' })

router.use(JWtMiddleware)

// management
router.use(userRouter.routes(), userRouter.allowedMethods())
router.use(roleRouter.routes(), roleRouter.allowedMethods())
router.use(configRouter.routes(), configRouter.allowedMethods())

// game
router.use(accountRouter.routes(), accountRouter.allowedMethods())
router.use(playerRouter.routes(), playerRouter.allowedMethods())
router.use(vehicleRouter.routes(), vehicleRouter.allowedMethods())
router.use(housesRouter.routes(), housesRouter.allowedMethods())
router.use(logRouter.routes(), logRouter.allowedMethods())
router.use(waypointRouter.routes(), waypointRouter.allowedMethods())
router.use(stashesRouter.routes(), stashesRouter.allowedMethods())

// dev
router.use(itemRouter.routes(), itemRouter.allowedMethods())
router.use(gangRouter.routes(), gangRouter.allowedMethods())
router.use(jobRouter.routes(), jobRouter.allowedMethods())
router.use(devVehicleRouter.routes(), devVehicleRouter.allowedMethods())

export default router
