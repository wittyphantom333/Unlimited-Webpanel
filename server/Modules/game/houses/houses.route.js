import router from '@koa/router'
import { checkPermission } from '../../web/role/role.controller'
import { ACTION, RESOURCE } from '../../../../common/permissions'
import { webLogger } from '../../../Logging/Modules/WebLogger'
import { UnlLogger } from '../../../Logging/UnlLogger'
import {
    deleteHouses,
    getPartialDatabaseHouses,
    getHouses,
    getHousesHandle,
    updateHousesFieldData,
    updateHousesOwnerData,
} from './houses.controller'
import {
    getDatabaseHousesCount,
    getHousesByCitizen,
    updateHousesCitizen,
} from './houses.service'
import { getPlayer } from '../player/player.service'

export const housesRouter = new router({ prefix: '/houses' })

housesRouter.post(
    '/',
    checkPermission(ACTION.GAME.HOUSES.READ, RESOURCE.GAME),
    async ctx => {
        webLogger.info(`${ctx.session.auth.user.name} requested all houses.`)
        try {
            const { startRow, count, filter, sortBy, descending } = ctx.request.body
            const houses = await getPartialDatabaseHouses(
                startRow,
                count,
                filter,
                sortBy,
                descending
            )

            ctx.body = {
                houses: houses,
            }
            ctx.status = 200
        } catch (e) {
            UnlLogger.error(e)
            ctx.body = e.message
            ctx.status = 500
        }
    }
)

housesRouter.get(
    '/:id',
    checkPermission(ACTION.GAME.HOUSES.READ, RESOURCE.GAME),
    async ctx => {
        webLogger.info(
            `${ctx.session.auth.user.name} requested houses with id ${ctx.params.id}.`
        )
        try {
            const id = ctx.params.id

            let houses = await getHouses(id)

            const player = await getPlayer(houses.citizenid)
            if (player) {
                houses.ownerName = `${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}`
            }

            ctx.body = {
                resCode: !!houses,
                houses: houses,
            }
            ctx.status = 200
        } catch (e) {
            UnlLogger.error(e)
            ctx.body = e.message
            ctx.status = 500
        }
    }
)

housesRouter.post(
    '/houses-count',
    checkPermission(ACTION.GAME.HOUSES.READ, RESOURCE.GAME),
    async ctx => {
        try {
            const { filter } = ctx.request.body
            const data = await getDatabaseHousesCount(filter)

            ctx.body = {
                count: data[0].count,
            }
            ctx.status = 200
        } catch (e) {
            UnlLogger.error(e)
            ctx.body = e.message
            ctx.status = 500
        }
    }
)

housesRouter.post(
    '/changeOwner',
    checkPermission(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME),
    async ctx => {
        webLogger.info(
            `${ctx.session.auth.user.name} requested change houses owner for id ${ctx.request.body.id}.`
        )
        try {
            const data = ctx.request.body
            const player = await getPlayer(data.citizenid)

            if (!player) {
                return (ctx.body = {
                    resCode: false,
                    resMsg: 'invalid_citizenid',
                })
            }

            const success = await updateHousesOwnerData(
                data.id,
                player.PlayerData.citizenid,
                player.PlayerData.license
            )

            ctx.body = {
                resCode: success,
                resMsg: success ? 'success' : 'missingData',
            }
            ctx.status = 200
        } catch (e) {
            UnlLogger.error(e)
            ctx.body = e.message
            ctx.status = 500
        }
    }
)

housesRouter.post(
    '/changeCitizen',
    checkPermission(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME),
    async ctx => {
        webLogger.info(
            `${ctx.session.auth.user.name} requested change houses Citizen for id ${ctx.request.body.id} (${ctx.request.body.citizen}).`
        )
        try {
            const { id, citizen, newCitizen } = ctx.request.body

            const citizens = await getHousesByCitizen(newCitizen)

            if (citizens.length > 0) {
                return (ctx.body = {
                    resCode: false,
                    resMsg: 'citizen_exists',
                })
            }

            const { resCode, resMsg } = await updateHousesCitizen(
                id,
                citizen,
                newCitizen.toUpperCase()
            )

            if (resCode) {
                const vehHandle = getHousesHandle(citizen)

                if (vehHandle) {
                    SetHousesNumberPlateText(vehHandle, newPlate.toUpperCase())
                }
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

housesRouter.post(
    '/updateField',
    checkPermission(ACTION.GAME.HOUSES.MODIFY, RESOURCE.GAME),
    async ctx => {
        webLogger.info(
            `${ctx.session.auth.user.name} requested change houses ${ctx.request.body.field} with id ${ctx.request.body.id}.`
        )
        try {
            const data = ctx.request.body
            const success = await updateHousesFieldData(
                data.houseName,
                data.field,
                data.value
            )

            /*const vehHandle = getHousesHandle(data.citizenid)
            if (vehHandle && success) {
                const vehNetOwner = NetworkGetEntityOwner(vehHandle)

                if (
                    vehNetOwner &&
                    (data.field === 'fuel' ||
                        data.field === 'body' ||
                        data.field === 'engine')
                ) {
                    TriggerClientEvent(
                        `unlWeb:houses:${data.field}`,
                        vehNetOwner,
                        data.citizenid,
                        data.value
                    )
                }
            }*/

            ctx.body = {
                resCode: success,
                resMsg: success ? 'success' : 'not_found',
            }
            ctx.status = 200
        } catch (e) {
            UnlLogger.error(e)
            ctx.body = e.message
            ctx.status = 500
        }
    }
)

housesRouter.post(
    '/delete',
    checkPermission(ACTION.GAME.HOUSES.DELETE, RESOURCE.GAME),
    async ctx => {
        webLogger.info(
            `${ctx.session.auth.user.name} requested delete houses id ${ctx.request.body.id}.`
        )
        try {
            const data = ctx.request.body
            const success = deleteHouses(data.id)
            const vehHandle = getHousesHandle(data.plate)

            if (vehHandle && success) {
                if (GetResourceState('AdvancedParking') === 'started') {
                    global.exports['AdvancedParking'].DeleteHouses(vehHandle)
                } else {
                    DeleteEntity(vehHandle)
                }
            }

            ctx.body = {
                resCode: success,
                resMsg: success ? null : 'not_found',
            }
            ctx.status = 200
        } catch (e) {
            UnlLogger.error(e)
            ctx.body = e.message
            ctx.status = 500
        }
    }
)

housesRouter.post(
    '/create',
    checkPermission(ACTION.GAME.HOUSES.CREATE, RESOURCE.GAME),
    async ctx => {
        webLogger.info(`${ctx.session.auth.user.name} requested create houses.`)
        try {
            const { citizenid, houses } = ctx.request.body

            const player = await getPlayer(citizenid)
            if (!player) {
                return (ctx.body = {
                    resCode: false,
                    resMsg: 'invalid_citizenid',
                })
            }

            const citizenids = await getHousesByCitizen(houses.citizenid)
            if (citizenids.length > 0) {
                return (ctx.body = {
                    resCode: false,
                    resMsg: 'citizenid_exists',
                })
            }

            const { resCode, resMsg } = await createPlayerHouses(player, houses)

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

export default housesRouter
