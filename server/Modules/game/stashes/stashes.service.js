import { oxmysql as MySQL } from '@overextended/oxmysql'
import { unlEnv } from '../../../globalData'
import { Game } from '../../../index'
import {
  addItem,
  editItem,
  getSupporterStash,
  removeItem,
  saveSupporterStash,
  STORAGE_IDENTIFIERS,
  swapItem,
} from '../../../Utils/item.utils'
import { getPlayer } from '../player/player.service'

export const parseStorageToObject = storageItems => {
  let storage = {}

  if (Array.isArray(storageItems)) {
    storageItems.forEach(item => {
      if (!item?.name) return

      const itemInfo = Game.QBCore.Shared.Items[item.name.toLowerCase()]
      storage[`${item.slot}`] = {
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
  } else {
    Object.entries(storageItems).forEach(([key, val]) => {
      const itemInfo = Game.QBCore.Shared.Items[val.name.toLowerCase()]
      storage[`${key}`] = {
        name: itemInfo['name'],
        amount: val.amount,
        info: val.info || '',
        label: itemInfo['label'],
        description: itemInfo['description'] || '',
        weight: itemInfo['weight'],
        type: itemInfo['type'],
        unique: itemInfo['unique'],
        useable: itemInfo['useable'],
        image: itemInfo['image'],
        shouldClose: itemInfo['shouldClose'],
        slot: key,
        combinable: itemInfo['combinable'],
      }
    })
  }

  return storage
}

const handleFinishStorageAction = async (
  storageItems,
  stashItems,
  settings,
  identifier
) => {
  if (storageItems) {
    // toDo: update ingame inv
    await updateStorage(storageItems, identifier, settings)

    TriggerEvent(
      'unlimited::update::storage',
      storageItems,
      settings.type,
      identifier
    )
  }

  if (stashItems) {
    await saveSupporterStash(stashItems)
    TriggerEvent('unlimited::update::supStash', stashItems)
  }
}

export const getDatabaseStashesCount = async filter => {
  let query = 'SELECT Sum(a.count) as count FROM ('
  unlEnv.config.stashTables.forEach(t => {
    query = query.concat(
      `${
        query === 'SELECT Sum(a.count) as count FROM (' ? ' ' : ' UNION ALL '
      }`,
      `SELECT 1 as count, '${t.type}' AS type, ${t.identifier} AS identifier FROM ${t.table} HAVING \`type\` like '%${filter}%' OR identifier like '%${filter}%'`
    )
  })

  return await MySQL.query(`${query}) a`)
}

export const getPartialDatabaseStashes = async (
  start,
  count,
  filter,
  orderBy,
  desc
) => {
  const DESC = desc ? 'DESC' : 'ASC'

  let query = ''
  unlEnv.config.stashTables.forEach(t => {
    query = query.concat(
      `${query.length === 0 ? '' : ' UNION '}`,
      `SELECT '${t.type}' AS type, ${t.identifier} AS identifier,  IFNULL(JSON_LENGTH(JSON_SEARCH(${t.itemColumn}, 'all', "%", NULL, '$[*].name')), JSON_LENGTH(${t.itemColumn})) AS item_count FROM ${t.table} HAVING \`type\` like '%${filter}%' OR identifier like '%${filter}%'`
    )
  })

  return await MySQL.query(
    `${query} ORDER BY ${orderBy} ${DESC} LIMIT ${start}, ${count}`
  )
}

export const updateStorage = async (items, identifier, settings) => {
  const saveItems = {}
  Object.values(items).forEach(i => {
    const { description: _, ...item } = i
    saveItems[i.slot] = item
  })

  return await MySQL.update(`UPDATE ?? SET ?? = ? WHERE ?? = ?`, [
    settings.table,
    settings.itemColumn,
    JSON.stringify(saveItems),
    settings.identifier,
    identifier,
  ])
}

export const getStorage = async (identifier, settings) => {
  const result = await MySQL.scalar(
    `SELECT ${settings.itemColumn} FROM ${settings.table} WHERE ${settings.identifier} = ?`,
    [identifier]
  )
  if (!result) return {}

  return parseStorageToObject(JSON.parse(result))
}

export const handleDeleteItem = async (
  identifier,
  settings,
  fromStorage,
  fromSlot,
  amount
) => {
  let items = null
  let storageUsed = false
  let supporterStashUsed = false

  if (fromStorage === STORAGE_IDENTIFIERS.STORAGE) {
    storageUsed = true
    items = await getStorage(identifier, settings)

    if (!items) {
      // unknown storage
      return { resCode: false, resMsg: 'unknown_storage' }
    }
  } else {
    supporterStashUsed = true
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

  await handleFinishStorageAction(
    storageUsed ? items : null,
    supporterStashUsed ? items : null,
    settings,
    identifier
  )

  return { resCode: true, resMsg: 'success', resItem: item }
}

export const handleAddItem = async (identifier, settings, storage, item) => {
  let items = null
  let storageUsed = false
  let supporterStashUsed = false

  if (storage === STORAGE_IDENTIFIERS.STORAGE) {
    storageUsed = true
    items = await getStorage(identifier, settings)

    if (!items) {
      // unknown storage
      return { resCode: false, resMsg: 'unknown_storage' }
    }
  } else {
    supporterStashUsed = true
    items = await getSupporterStash()
  }

  const { resCode, resMsg } = addItem(
    items,
    item.name,
    null,
    item.amount,
    item.info,
    settings.maxSlots
  )

  if (!resCode) {
    return { resCode: resCode, resMsg: resMsg }
  }

  await handleFinishStorageAction(
    storageUsed ? items : null,
    supporterStashUsed ? items : null,
    settings,
    identifier
  )

  return { resCode: true, resMsg: 'success' }
}

export const handleEditItem = async (
  identifier,
  settings,
  fromStorage,
  fromSlot,
  item
) => {
  let items = null
  let storageUsed = false
  let supporterStashUsed = false

  if (fromStorage === STORAGE_IDENTIFIERS.STORAGE) {
    storageUsed = true
    items = await getStorage(identifier, settings)

    if (!items) {
      // unknown storage
      return { resCode: false, resMsg: 'unknown_storage' }
    }
  } else {
    supporterStashUsed = true
    items = await getSupporterStash()
  }

  const foundItem = items[fromSlot]
  if (!foundItem) return { resCode: false, resMsg: 'moved' }

  const { resCode, resMsg } = editItem(items, item)

  if (!resCode) {
    return { resCode: resCode, resMsg: resMsg }
  }

  await handleFinishStorageAction(
    storageUsed ? items : null,
    supporterStashUsed ? items : null,
    settings,
    identifier
  )

  return { resCode: true, resMsg: 'success' }
}

export const handleClearStorage = async (identifier, settings) => {
  await handleFinishStorageAction({}, null, settings, identifier)
  return { resCode: true, resMsg: 'success' }
}

export const handleMoveStashItem = async (
  identifier,
  settings,
  fromStorage,
  toStorage,
  fromSlot,
  toSlot,
  amount
) => {
  let storageItems = null
  let supporterStashItems = null
  let storageUsed = false
  let supporterStashUsed = false
  let didSwap = false

  // load player if needed
  if (
    fromStorage === STORAGE_IDENTIFIERS.STORAGE ||
    toStorage === STORAGE_IDENTIFIERS.STORAGE
  ) {
    storageUsed = true
    storageItems = await getStorage(identifier, settings)

    if (!storageItems) {
      // unknown storage
      return { resCode: false, resMsg: 'unknown_storage' }
    }
  }

  // load sup stash if needed
  if (
    fromStorage === STORAGE_IDENTIFIERS.STASH ||
    toStorage === STORAGE_IDENTIFIERS.STASH
  ) {
    supporterStashUsed = true
    supporterStashItems = await getSupporterStash()
  }

  // get from item/s
  const fromItems =
    fromStorage === STORAGE_IDENTIFIERS.STORAGE
      ? storageItems
      : supporterStashItems
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
    toStorage === STORAGE_IDENTIFIERS.STORAGE
      ? storageItems
      : supporterStashItems
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
      settings.maxSlots
    )

    if (!resCode && resMsg === 'noSlot') {
      // add error
      return { resCode: true, resMsg: 'internal' }
    }
  }

  await handleFinishStorageAction(
    storageUsed ? storageItems : null,
    supporterStashUsed ? supporterStashItems : null,
    settings,
    identifier
  )

  return {
    resCode: true,
    resMsg: 'success',
    resItems: { didSwap: didSwap, item: item.name, toItem: toItem?.name },
  }
}
