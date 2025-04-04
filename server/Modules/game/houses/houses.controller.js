import {
    getOwnedHousesPartial,
    getPlayerOwnedHousesPartial,
    getHousesById,
    updateHousesField,
    updateHousesOwner,
} from './houses.service'
import {unlEnv} from '../../../globalData'
import {Game} from "../../../index";
import {UnlLogger} from "../../../Logging/UnlLogger";

export const getHousesHandle = citizenid => {
    const housesHandles = Game.QBCore.Functions.GetPlayers()
    const searchCitizen = citizenid.trim().toUpperCase()

    let foundHandle = false
    housesHandles.some(function (handle) {
        const curCitizen = Game.QBCore.Functions.GetPlayerByCitizenId(handle)
        if (curCitizen.trim() === searchCitizen) {
            foundHandle = handle
            return true
        }
    })

    return foundHandle
}

export const getPartialDatabaseHouses = async (
    start,
    count,
    filter,
    orderBy,
    desc
) => {
    const ownedHouses = await getOwnedHousesPartial(
        start,
        count,
        filter,
        orderBy,
        desc
    )
    if (ownedHouses.length === 0) return []

    /*const housesHandles = GetAllHouses()
    housesHandles.forEach(handle => {
      const plate = GetHousesNumberPlateText(handle)
      const matchedVeh = ownedHouses.find(
          e => e.plate.trim() === plate.trim().toUpperCase()
      )
      if (matchedVeh) matchedVeh.spawned = true
    })*/

    return ownedHouses
}

export const getPlayerHouses = async (
    startRow,
    count,
    filter,
    sortBy,
    descending,
    citizenid
) => {
    const ownedHouses = await getPlayerOwnedHousesPartial(
        startRow,
        count,
        filter,
        sortBy,
        descending,
        citizenid
    )
    if (ownedHouses.length === 0) return []

    return ownedHouses
}

export const getHouses = async id => {
    let houses = await getHousesById(id)

    houses = houses[0]
    if (!houses) return null

    return houses
}

export const updateHousesOwnerData = async (id, citizenid, license) => {
    return await updateHousesOwner(id, citizenid, license)
}

export const updateHousesFieldData = async (houseName, field, value) => {
    const fields = [
        'keyholders',
        'stash',
        'wardrobe',
        'logout',
        'type',
        'stashLevel',
        'extras',
        'furniture',
        'price',
        'doorCoords',
        'doorInside',
        'houseGarageCoords',
        'houseGarageInside',
        'houseGarageSpawn',
        'houseGarageStore',
        'stars',
        'pool',
        'garden',
        'camerasystem',
        'mlo',
        'maxFurnitureRange'
    ]

    const properties = [
        'price',
        'doorCoords',
        'doorInside',
        'houseGarageCoords',
        'houseGarageInside',
        'houseGarageSpawn',
        'houseGarageStore',
        'stars',
        'pool',
        'garden',
        'camerasystem',
        'mlo',
        'maxFurnitureRange'
    ]

    if (!fields.includes(field)) return false

    let cField = field
    let cTable = unlEnv.config.housingTable
    if (properties.includes(field)) cTable = unlEnv.config.housingTableProperties

    return await updateHousesField(houseName, cField, value, cTable)
}

export const deleteHouses = async id => {
    return await deleteHousesDataset(id)
}
