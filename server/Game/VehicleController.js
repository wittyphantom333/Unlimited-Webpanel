import { UnlLogger } from '../Logging/UnlLogger'
import { getVehicleByPlate } from '../Modules/game/vehicle/vehicle.service'

export default class VehicleController {
  constructor() {
    UnlLogger.info('Successfully started VehicleController', {
      discord: false,
    })
  }

  async GetLiveMapVehicles() {
    const vehicleHandles = GetAllVehicles()

    let vehicles = []

    for (const handle of vehicleHandles) {
      try {
        if (!DoesEntityExist(handle)) continue

        const plate = GetVehicleNumberPlateText(handle)
        const isOwnedVehicle = await getVehicleByPlate(plate)

        if (isOwnedVehicle[0]) {
          const [vehX, vehY, vehZ] = GetEntityCoords(handle)
          isOwnedVehicle[0].coords = { x: vehX, y: vehY }
          vehicles.push(isOwnedVehicle[0])
        }
      } catch (e) {
        // ignore errors due e.g. handle not valid anymore
      }
    }

    return vehicles
  }
}
