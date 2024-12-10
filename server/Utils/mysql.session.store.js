import { oxmysql as MySQL } from '@overextended/oxmysql'
import { genid } from './genid.session.utils'

async function cleanupExpired(maxAge) {
  const [rows] = await MySQL.query(
    'DELETE FROM ?? WHERE `modified` > FROM_UNIXTIME(UNIX_TIMESTAMP() - ?)',
    ['unl_session_store', maxAge / 1000]
  )

  if (rows.length === 0) {
    return null
  }

  return JSON.parse(rows[0].payload)
}

async function retrieveSession(key, maxAge) {
  const rows = await MySQL.query(
    'SELECT `payload` FROM ?? WHERE `session_id` = ? AND `modified` > FROM_UNIXTIME(UNIX_TIMESTAMP() - ?) LIMIT 1',
    ['unl_session_store', key, maxAge / 1000]
  )

  if (rows.length === 0) {
    return null
  }

  return JSON.parse(rows[0].payload)
}

// store
function storeSession(key, sess) {
  const payload = JSON.stringify(sess)
  const query =
    'INSERT INTO ?? (session_id, modified, payload) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE session_id=?, modified=?, payload=?'
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

  return MySQL.query(query, [
    'unl_session_store',
    key,
    now,
    payload,
    key,
    now,
    payload,
  ])
}

// drop session
async function destroySession(key) {
  const [result] = await MySQL.query(
    'DELETE FROM ?? WHERE `session_id` = ? LIMIT 1',
    ['unl_session_store', key]
  )

  return result.affectedRows > 0
}

module.exports = {
  get: retrieveSession,
  set: storeSession,
  destroy: destroySession,
  cleanup: cleanupExpired,
  genid: genid,
}
