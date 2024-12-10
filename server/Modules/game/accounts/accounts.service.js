import { oxmysql as MySQL } from '@overextended/oxmysql'

export const getPartialDatabaseAccounts = async (
  start,
  count,
  filter,
  orderBy,
  desc
) => {
  const DESC = desc ? 'DESC' : 'ASC'
  const query = `SELECT license, name, unix_timestamp(max(last_updated)) as last_active, count(license) as character_count FROM players WHERE license LIKE ? OR name LIKE ? OR citizenid LIKE ? OR JSON_EXTRACT(\`charinfo\`, '$.firstname') LIKE ? OR JSON_EXTRACT(\`charinfo\`, '$.lastname') LIKE ? GROUP BY license ORDER BY ${orderBy} ${DESC} LIMIT ?, ?`

  return await MySQL.query(query, [
    `%${filter}%`,
    `%${filter}%`,
    `%${filter}%`,
    `%${filter}%`,
    `%${filter}%`,
    start,
    count,
  ])
}
export const getDatabaseAccountsCount = async filter => {
  return await MySQL.query(
    `SELECT count(*) as count FROM players WHERE license LIKE ? OR name LIKE ? OR citizenid LIKE ? OR JSON_EXTRACT(\`charinfo\`, '$.firstname') LIKE ? OR JSON_EXTRACT(\`charinfo\`, '$.lastname') LIKE ?`,
    [`%${filter}%`, `%${filter}%`, `%${filter}%`, `%${filter}%`, `%${filter}%`]
  )
}

export const getDatabaseAccountsPlayersCount = async (license, filter) => {
  return await MySQL.query(
    `SELECT count(*) as count FROM players WHERE license LIKE ? or name LIKE ? OR citizenid LIKE ? OR JSON_EXTRACT(\`charinfo\`, '$.firstname') LIKE ? OR JSON_EXTRACT(\`charinfo\`, '$.lastname') LIKE ?`,
    [license, `%${filter}%`, `%${filter}%`, `%${filter}%`, `%${filter}%`]
  )
}

export const getPartialDatabaseAccountPlayers = async (
  license,
  start,
  count,
  filter,
  orderBy,
  desc
) => {
  const DESC = desc ? 'DESC' : 'ASC'
  const query = `SELECT name, license, citizenid, job, gang, charinfo, JSON_EXTRACT(\`charinfo\`, '$.firstname') as firstname, JSON_EXTRACT(\`charinfo\`, '$.lastname') as lastname FROM players WHERE license = ? AND (citizenid LIKE ? or name LIKE ? or JSON_EXTRACT(\`charinfo\`, '$.firstname') LIKE ? or JSON_EXTRACT(\`charinfo\`, '$.lastname') LIKE ?) ORDER BY ${orderBy} ${DESC} LIMIT ?, ?;`

  return await MySQL.query(query, [
    license,
    `%${filter}%`,
    `%${filter}%`,
    `%${filter}%`,
    `%${filter}%`,
    start,
    count,
  ])
}
