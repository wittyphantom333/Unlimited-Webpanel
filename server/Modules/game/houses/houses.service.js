import {oxmysql as MySQL} from '@overextended/oxmysql'
import {unlEnv} from '../../../globalData'
import {UnlLogger} from '../../../Logging/UnlLogger'

export const getOwnedHousesPartial = async (
    start,
    count,
    filter,
    orderBy,
    desc,
    citizenid
) => {
    const DESC = desc ? 'DESC' : 'ASC'
    const housingTable = unlEnv.config.housingTable
    const housingTableProperties = unlEnv.config.housingTableProperties

    const query = `SELECT a.id                AS id,
                          a.apart_id          AS apart_id,
                          a.citizenid         AS citizenid,
                          a.keyholders        AS keyholders,
                          a.houseName         AS houseName,
                          a.stash             AS stash,
                          a.wardrobe          AS wardrobe,
                          a.logout            AS logout,
                          a.type              AS type,
                          a.gtype             AS gtype,
                          a.stashLevel        AS stashLevel,
                          a.stashName         AS stashName,
                          a.url               AS url,
                          a.shared            AS shared,
                          a.extras            AS extras,
                          a.furniture         AS furniture,
                          b.doorCoords        AS doorCoords,
                          b.doorInside        AS doorInside,
                          b.houseGarageCoords AS houseGarageCoords,
                          b.houseGarageInside AS houseGarageInside,
                          b.houseGarageSpawn  AS houseGarageSpawn,
                          b.houseGarageStore  AS houseGarageStore,
                          b.mlo               AS mlo,
                          b.price             AS price,
                          b.stars             AS stars,
                          b.camerasystem      AS camerasystem,
                          b.pool              AS pool,
                          b.garden            AS garden,
                          b.canVisit          AS canVisit,
                          b.shared            as shared,
                          b.maxFurnitureRange AS maxFurnitureRange
                   FROM ${housingTable} a
                            JOIN ${housingTableProperties} b
                                 ON a.houseName = b.houseName
                   WHERE a.id LIKE ?
                      or a.citizenid LIKE ?
                      or a.houseName LIKE ?
                      or a.stashName LIKE ?
                      or a.stash LIKE ?
                   ORDER BY ${orderBy} ${DESC} LIMIT ?, ?`

    return await MySQL.query(query, [
        `%${filter}%`,
        citizenid,
        `%${filter}%`,
        `%${filter}%`,
        `%${filter}%`,
        start,
        count,
    ])
}
export const getPlayerOwnedHousesPartial = async (
    start,
    count,
    filter,
    orderBy,
    desc,
    citizenid
) => {
    const DESC = desc ? 'DESC' : 'ASC'

    const housingTable = unlEnv.config.housingTable
    const housingTableProperties = unlEnv.config.housingTableProperties


    const query = `SELECT a.id                AS id,
                          a.apart_id          AS apart_id,
                          a.citizenid         AS citizenid,
                          a.keyholders        AS keyholders,
                          a.houseName         AS houseName,
                          a.stash             AS stash,
                          a.wardrobe          AS wardrobe,
                          a.logout            AS logout,
                          a.type              AS type,
                          a.gtype             AS gtype,
                          a.stashLevel        AS stashLevel,
                          a.stashName         AS stashName,
                          a.url               AS url,
                          a.shared            AS shared,
                          a.extras            AS extras,
                          a.furniture         AS furniture,
                          b.doorCoords        AS doorCoords,
                          b.doorInside        AS doorInside,
                          b.houseGarageCoords AS houseGarageCoords,
                          b.houseGarageInside AS houseGarageInside,
                          b.houseGarageSpawn  AS houseGarageSpawn,
                          b.houseGarageStore  AS houseGarageStore,
                          b.mlo               AS mlo,
                          b.price             AS price,
                          b.stars             AS stars,
                          b.camerasystem      AS camerasystem,
                          b.pool              AS pool,
                          b.garden            AS garden,
                          b.canVisit          AS canVisit,
                          b.shared            as shared,
                          b.maxFurnitureRange AS maxFurnitureRange
                   FROM ${housingTable} a
                            JOIN ${housingTableProperties} b
                                 ON a.houseName = b.houseName
                   WHERE a.citizenid LIKE ?
                   ORDER BY ${orderBy} ${DESC} LIMIT ?, ?`

    return await MySQL.query(query, [
        citizenid,
        start,
        count,
    ])
}

export const getDatabaseHousesCount = async filter => {
    const housingTable = unlEnv.config.housingTable
    const housingTableProperties = unlEnv.config.housingTableProperties
    return await MySQL.query(
        `SELECT count(*) as count
         FROM ${housingTable} a
             JOIN ${housingTableProperties} b
         ON a.houseName = b.houseName
         WHERE a.citizenid LIKE ?`,
        [`%${filter}%`]
    )
}

export const getPlayerDatabaseHousesCount = async (filter) => {
    const housingTable = unlEnv.config.housingTable
    const housingTableProperties = unlEnv.config.housingTableProperties
    return await MySQL.query(
        `SELECT count(*) as count
         FROM ${housingTable} a
             JOIN ${housingTableProperties} b
         ON a.houseName = b.houseName
         WHERE a.citizenid = ?`,
        [`%${filter}%`]
    )
}

export const getHousesByCitizen = async citizenid => {
    const housingTable = unlEnv.config.housingTable
    const housingTableProperties = unlEnv.config.housingTableProperties
    return await MySQL.query(
        `SELECT a.id, a.citizenid
         FROM ${housingTable} a
                  JOIN ${housingTableProperties} b
                       ON a.houseName = b.houseName
         WHERE a.citizenid = ?`,
        [citizenid]
    )
}

export const getHousesById = async id => {
    const housingTable = unlEnv.config.housingTable
    const housingTableProperties = unlEnv.config.housingTableProperties
    return await MySQL.query(`SELECT *
                              FROM ${housingTable} a
                                       JOIN ${housingTableProperties} b
                                            ON a.houseName = b.houseName
                              WHERE a.id = ?`, [id])
}

export const updateHousesOwner = async (id, citizenid, license) => {
    const housingTable = unlEnv.config.housingTable
    const housingTableProperties = unlEnv.config.housingTableProperties
    return await MySQL.update(
        `UPDATE ${housingTable}
         SET citizenid = ?,
             license   = ?
         WHERE id = ?`,
        [citizenid, license, id],
        affectedRows => {
            return !!affectedRows
        }
    )
}

export const updateHousesField = async (houseName, field, value, table) => {
    return await MySQL.update(
        `UPDATE ${table}
         SET ?? = ?
         WHERE houseName = ?`,
        [field, value, houseName],
        affectedRows => {
            return !!affectedRows
        }
    )
}

export const updateHousesCitizen = async (id, plate, newPlate) => {
    const queries = [
        {
            query:
                "UPDATE ${housingTable} SET `mods` = JSON_REPLACE(`mods`, '$.plate', :newPlate), plate = :newPlate WHERE plate = :plate AND id = :id",
            values: {newPlate: newPlate, plate: plate, id: id},
        },
    ]

    unlEnv.config.vehTables.forEach(veh => {
        queries.push({
            query: `UPDATE ${veh.table}
                    SET ${veh.column} = :newPlate
                    WHERE ${veh.column} = :plate`,
            values: {newPlate: newPlate, plate: plate},
        })
    })

    const success = await MySQL.transaction(queries)

    return {resCode: success, resMsg: success ? 'success' : 'sql_error'}
}
