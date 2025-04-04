import {UnlLogger} from '../Logging/UnlLogger'
import {getHousesByCitizen} from '../Modules/game/houses/houses.service'

export default class HousesController {
    constructor() {
        UnlLogger.info('Successfully started HousesController', {
            discord: false,
        })
    }

    async GetLiveMapHouses() {
        const housesHandles = GetAllHouses()

        let houses = []

        for (const handle of housesHandles) {
            try {
                if (!DoesEntityExist(handle)) continue

                const isOwnedHouses = await getHousesByCitizen(citizenid)

                if (isOwnedHouses[0]) {
                    const [vehX, vehY, vehZ] = GetEntityCoords(handle)
                    isOwnedHouses[0].coords = {x: vehX, y: vehY}
                    houses.push(isOwnedHouses[0])
                }
            } catch (e) {
                // ignore errors due e.g. handle not valid anymore
            }
        }

        return houses
    }
}
