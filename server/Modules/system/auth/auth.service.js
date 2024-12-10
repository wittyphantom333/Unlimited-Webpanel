import { Database } from '../../../index'

export const getHashedPassword = password => {
  const sha256 = crypto.createHash('sha256')
  return sha256.update(password).digest('base64')
}

export const checkCredentials = async (username, password) => {
  const hashedPassword = getHashedPassword(password)
  const success = Database.checkCredentials(username, hashedPassword)

  return success ? Database.getUser(username) : false
}
