import { unlEnv } from '../../../../globalData'
import {
  getPlayer,
  getPlayerInventoryFromDB,
  savePlayerInventoryToDB,
} from '../player.service'
import {
  addItem,
  editItem,
  getSupporterStash,
  removeItem,
  saveSupporterStash,
  STORAGE_IDENTIFIERS,
  swapItem,
} from '../../../../Utils/item.utils'
import { Game } from '../../../..'
import { playerLogger } from '../../../../Logging/Modules/PlayerLogger'

// toDo: support custom item values in inventory (need inv with support)
const parseItemsToObject = items => {
  let rebuildedInv = {}
  items.forEach(item => {
    rebuildedInv[`${item.slot}`] = item
  })

  return rebuildedInv
}

const handleFinishInvAction = async (player, stashItems, itemName) => {
  if (player) {
    global.exports[unlEnv.resourceName].parseItemUpdate(
      unlEnv.unlQBName,
      player.PlayerData.citizenid,
      player.PlayerData.items
    )

    if (!player.Offline) {
      if (itemName)
        TriggerClientEvent(
          'inventory:client:CheckWeapon',
          player.PlayerData.source,
          itemName
        )

      TriggerClientEvent(
        'inventory:client:UpdatePlayerInventory',
        player.PlayerData.source,
        false
      )
    }

    TriggerEvent('unlimited::update::playerInv', player.PlayerData)
  }

  if (stashItems) {
    await saveSupporterStash(stashItems)
    TriggerEvent('unlimited::update::supStash', stashItems)
  }
}

export const handleEditItem = async (
  citizenid,
  fromStorage,
  fromSlot,
  item
) => {
  let items = null
  let player = null
  let playerUsed = false
  let stashUsed = false

  if (fromStorage === STORAGE_IDENTIFIERS.PLAYER) {
    playerUsed = true
    player = await getPlayer(citizenid)

    if (!player) {
      // unknown citizen id
      return { resCode: false, resMsg: 'unknown_citizenid' }
    }

    if (Array.isArray(player.PlayerData.items)) {
      player.PlayerData.items = parseItemsToObject(player.PlayerData.items)
    }

    items = player.PlayerData.items
  } else {
    stashUsed = true
    items = await getSupporterStash()
  }

  const foundItem = items[fromSlot]
  if (!foundItem) return { resCode: false, resMsg: 'moved' }

  const { resCode, resMsg } = editItem(items, item)

  if (!resCode) {
    return { resCode: resCode, resMsg: resMsg }
  }

  await handleFinishInvAction(
    playerUsed ? player : null,
    stashUsed ? items : null,
    item.name
  )

  return { resCode: true, resMsg: 'success' }
}

export const handleAddItem = async (citizenid, storage, item) => {
  let items = null
  let player = null
  let playerUsed = false
  let stashUsed = false

  if (storage === STORAGE_IDENTIFIERS.PLAYER) {
    playerUsed = true
    player = await getPlayer(citizenid)

    if (!player) {
      // unknown citizen id
      return { resCode: false, resMsg: 'unknown_citizenid' }
    }

    if (Array.isArray(player.PlayerData.items)) {
      player.PlayerData.items = parseItemsToObject(player.PlayerData.items)
    }

    items = player.PlayerData.items
  } else {
    stashUsed = true
    items = await getSupporterStash()
  }

  const { resCode, resMsg } = addItem(
    items,
    item.name,
    null,
    item.amount,
    item.info,
    unlEnv.maxPlayerSlots
  )

  if (!resCode) {
    return { resCode: resCode, resMsg: resMsg }
  }

  await handleFinishInvAction(
    playerUsed ? player : null,
    stashUsed ? items : null,
    item.name
  )

  return { resCode: true, resMsg: 'success' }
}

export const handleDeleteItem = async (
  citizenid,
  fromStorage,
  fromSlot,
  amount
) => {
  let items = null
  let player = null
  let playerUsed = false
  let stashUsed = false

  if (fromStorage === STORAGE_IDENTIFIERS.PLAYER) {
    playerUsed = true
    player = await getPlayer(citizenid)

    if (!player) {
      // unknown citizen id
      return { resCode: false, resMsg: 'unknown_citizenid' }
    }

    if (Array.isArray(player.PlayerData.items)) {
      player.PlayerData.items = parseItemsToObject(player.PlayerData.items)
    }

    items = player.PlayerData.items
  } else {
    stashUsed = true
    items = await getSupporterStash()
  }

  const item = items[fromSlot]
  if (!item) return { resCode: false, resMsg: 'moved' }

  const itemFromAmount = amount || item.amount
  if (itemFromAmount < 0) return { resCode: false, resMsg: 'negative' }

  removeItem(
    items,
    fromSlot,
    item.amount < itemFromAmount ? item.amount : itemFromAmount
  )

  await handleFinishInvAction(
    playerUsed ? player : null,
    stashUsed ? items : null,
    item.name
  )

  return { resCode: true, resMsg: 'success', resItem: item }
}

export const handleMoveItem = async (
  citizenid,
  fromStorage,
  toStorage,
  fromSlot,
  toSlot,
  amount
) => {
  let player = null
  let stashItems = null
  let playerUsed = false
  let stashUsed = false
  let didSwap = false

  // load player if needed
  if (
    fromStorage === STORAGE_IDENTIFIERS.PLAYER ||
    toStorage === STORAGE_IDENTIFIERS.PLAYER
  ) {
    playerUsed = true
    player = await getPlayer(citizenid)

    if (!player) {
      // unknown citizen id
      return { resCode: false, resMsg: 'unknown_citizenid' }
    }

    if (Array.isArray(player.PlayerData.items)) {
      player.PlayerData.items = parseItemsToObject(player.PlayerData.items)
    }
  }

  // load sup stash if needed
  if (
    fromStorage === STORAGE_IDENTIFIERS.STASH ||
    toStorage === STORAGE_IDENTIFIERS.STASH
  ) {
    stashUsed = true
    stashItems = await getSupporterStash()
  }

  // get from item/s
  const fromItems =
    fromStorage === STORAGE_IDENTIFIERS.PLAYER
      ? player.PlayerData.items
      : stashItems
  const item = fromItems[fromSlot]
  if (!item) return { resCode: false, resMsg: 'moved' }

  // parse amount
  const itemFromAmount = amount || item.amount
  if (itemFromAmount < 0) return { resCode: false, resMsg: 'negative' }

  // not enough
  if (item.amount < itemFromAmount)
    return { resCode: false, resMsg: 'not_enough' }

  // get to item/s
  const toItems =
    toStorage === STORAGE_IDENTIFIERS.PLAYER
      ? player.PlayerData.items
      : stashItems
  const toItem = toItems[toSlot]

  if (
    (toItem && toItem.name !== item.name) ||
    (toItem && toItem.name === toItem.name && toItem.unique)
  ) {
    didSwap = true
    swapItem(fromItems, toItems, fromSlot, toSlot)
  } else {
    removeItem(fromItems, fromSlot, itemFromAmount)
    const { resCode, resMsg } = addItem(
      toItems,
      item.name,
      toSlot,
      itemFromAmount,
      item.info,
      unlEnv.maxPlayerSlots
    )

    if (!resCode && resMsg === 'noSlot') {
      // add error
      return { resCode: true, resMsg: 'internal' }
    }
  }

  await handleFinishInvAction(
    playerUsed ? player : null,
    stashUsed ? stashItems : null,
    item.name
  )

  return {
    resCode: true,
    resMsg: 'success',
    resItems: { didSwap: didSwap, item: item.name, toItem: toItem?.name },
  }
}

export const handleClearInventory = async citizenid => {
  let player = await getPlayer(citizenid)

  if (!player) {
    // unknown citizen id
    return { resCode: false, resMsg: 'unknown_citizenid' }
  }

  player.PlayerData.items = {}
  await handleFinishInvAction(player, null, null)

  return { resCode: true, resMsg: 'success' }
}

export const handleFixInventory = async citizenid => {
  const data = await getPlayerInventoryFromDB(citizenid)

  if (!data) {
    // unknown citizen id
    return { resCode: false, resMsg: 'unknown_citizenid' }
  }

  let inv = JSON.parse(data.inventory)
  if (Array.isArray(inv)) {
    inv = parseItemsToObject(inv)
  }

  const resItems = []
  const newInv = {}
  for (const [slot, item] of Object.entries(inv)) {
    const itemInfo = Game.QBCore.Shared.Items[item?.name?.toLowerCase()]

    if (!itemInfo) {
      playerLogger.warn(
        `[${citizenid}] Deleted player inventory item ${item.name} due deleted item defintion (QBShared).`
      )
      resItems.push(item)
      continue
    }

    newInv[slot] = item
  }

  await savePlayerInventoryToDB(citizenid, JSON.stringify(newInv))

  return { resCode: true, resMsg: 'success', resItems: resItems }
}
