import { Database, Game } from '../index'
import { devLogger } from '../Logging/Modules/DevLogger'

export const STORAGE_IDENTIFIERS = {
  STORAGE: 'c',
  PLAYER: 'p',
  STASH: 's',
}

export const getSupporterStash = async () => {
  let stash = {}
  const result = Database.getConfigValue('supporterStash')
  if (!result) return stash

  result.forEach(item => {
    const itemInfo = Game.QBCore.Shared.Items[item?.name?.toLowerCase()]

    if (!itemInfo) {
      devLogger.warn(
        `Skipped supporter stash item ${item.name} due deleted item defintion (QBShared). Try fix items in configuration tab.`
      )
      return
    }

    stash[`${item.slot}`] = {
      name: itemInfo['name'],
      amount: item.amount,
      info: item.info || '',
      label: itemInfo['label'],
      description: itemInfo['description'] || '',
      weight: itemInfo['weight'],
      type: itemInfo['type'],
      unique: itemInfo['unique'],
      useable: itemInfo['useable'],
      image: itemInfo['image'],
      shouldClose: itemInfo['shouldClose'],
      slot: item.slot,
      combinable: itemInfo['combinable'],
    }
  })

  return stash
}

export const saveSupporterStash = async items => {
  await Database.updateConfigValue(
    'supporterStash',
    Object.keys(items).map(function (key) {
      return items[key]
    })
  )
}

export const deleteItemTypeFromSupportStash = async itemName => {
  let stash = {}
  let count = 0
  const result = Database.getConfigValue('supporterStash')
  if (!result) return

  result.forEach(item => {
    if (itemName.toLowerCase() === item.name.toLowerCase()) {
      count++
      return
    }

    const itemInfo = Game.QBCore.Shared.Items[item.name.toLowerCase()]
    stash[`${item.slot}`] = {
      name: itemInfo['name'],
      amount: item.amount,
      info: item.info || '',
      label: itemInfo['label'],
      description: itemInfo['description'] || '',
      weight: itemInfo['weight'],
      type: itemInfo['type'],
      unique: itemInfo['unique'],
      useable: itemInfo['useable'],
      image: itemInfo['image'],
      shouldClose: itemInfo['shouldClose'],
      slot: item.slot,
      combinable: itemInfo['combinable'],
    }
  })

  await saveSupporterStash(stash)

  if (count > 0) {
    devLogger.info(
      `Deleted ${count}x ${itemName} from supporter stash due item type deleting.`
    )
    TriggerEvent('unlimited::update::supStash', stash)
  }

  return { resCode: true, resMsg: 'success' }
}

export const swapItem = (fromStorage, toStorage, fromSlot, toSlot) => {
  const fromItem = Object.assign({}, fromStorage[fromSlot])
  const toItem = Object.assign({}, toStorage[toSlot])
  if (fromItem) fromItem.slot = toSlot
  if (toItem) toItem.slot = fromSlot
  fromStorage[fromSlot] = toItem
  toStorage[toSlot] = fromItem
}

export const removeItem = (items, slot, amount) => {
  if (items[slot].amount > amount) {
    // bigger amount
    items[slot].amount = items[slot].amount - amount
    return
  }

  delete items[slot]
}

export const editItem = (items, item) => {
  const itemInfo = Game.QBCore.Shared.Items[item.name.toLowerCase()]

  if (itemInfo) {
    items[item.slot] = item

    return { resCode: true, resMsg: 'success' }
  } else {
    // item name not valid
    return { resCode: false, resMsg: 'invalid_item' }
  }
}

export const addItem = (items, itemName, slot, amount, info = {}, maxSlots) => {
  const itemInfo = Game.QBCore.Shared.Items[itemName.toLowerCase()]

  if (itemInfo) {
    // valid item
    if (itemInfo.type === 'weapon') {
      // handle weapon special data
      info.serie =
        info.serie ||
        `${Game.QBCore.Shared.RandomInt(2)}${Game.QBCore.Shared.RandomStr(
          3
        )}${Game.QBCore.Shared.RandomInt(1)}${Game.QBCore.Shared.RandomStr(
          2
        )}${Game.QBCore.Shared.RandomInt(3)}${Game.QBCore.Shared.RandomStr(
          4
        )}`.toString()
      info.quality = info.quality || 100
    }

    if (!slot) {
      let foundSlot = null
      Object.entries(items).forEach(([key, val]) => {
        if (
          val.name.toLowerCase() === itemName.toLowerCase() &&
          !itemInfo.unique &&
          !foundSlot
        ) {
          foundSlot = val.slot
        }
      })
      slot = foundSlot
    }

    if (
      slot &&
      items[slot] &&
      items[slot].name.toLowerCase() === itemName.toLowerCase() &&
      !itemInfo.unique
    ) {
      // merge item if not unique
      items[slot].amount = items[slot].amount + amount

      return { resCode: true, resMsg: 'success' }
    } else if ((!itemInfo.unique && slot) || (slot && !items[slot])) {
      // slot empty and not unique
      items[slot] = {
        name: itemInfo.name,
        amount: amount,
        info: info || '',
        label: itemInfo.label,
        description: itemInfo.description || '',
        weight: itemInfo.weight,
        type: itemInfo.type,
        unique: itemInfo.unique,
        useable: itemInfo.useable,
        image: itemInfo.image,
        shouldClose: itemInfo.shouldClose,
        slot: slot,
        combinable: itemInfo.combinable,
      }

      return { resCode: true, resMsg: 'success' }
    } else if (itemInfo.unique || !slot || itemInfo.type === 'weapon') {
      // unique or weapon or no slot specified
      for (let i = 1; i <= maxSlots; i++) {
        if (!items[i]) {
          items[i] = {
            name: itemInfo.name,
            amount: amount,
            info: info || '',
            label: itemInfo.label,
            description: itemInfo.description || '',
            weight: itemInfo.weight,
            type: itemInfo.type,
            unique: itemInfo.unique,
            useable: itemInfo.useable,
            image: itemInfo.image,
            shouldClose: itemInfo.shouldClose,
            slot: i,
            combinable: itemInfo.combinable,
          }

          return { resCode: true, resMsg: 'success' }
        }
      }

      // no free slot
      return { resCode: false, resMsg: 'noSlot' }
    }
  } else {
    // item name not valid
    return { resCode: false, resMsg: 'invalid_item' }
  }
}
