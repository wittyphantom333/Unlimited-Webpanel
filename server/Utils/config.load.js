import { deepMergeObjects } from '../../common/deepMergeObjects'
import defaultConfig from '../config.default.json'

export const getConfig = () => {
  const resourceName = GetCurrentResourceName()
  const config = JSON.parse(LoadResourceFile(resourceName, 'config.json'))

  return deepMergeObjects({}, defaultConfig, config)
}
