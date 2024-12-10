import axios from '../../libs/axios'
import JwtService from './customJWTService'

export function useJwt(axiosIns, jwtOverrideConfig) {
  const jwt = new JwtService(axiosIns, jwtOverrideConfig)

  return {
    jwt,
  }
}

const { jwt } = useJwt(axios, {})

export default jwt
