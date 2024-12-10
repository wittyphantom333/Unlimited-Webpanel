import axios from 'axios'
import { externalHosting } from '../../../../common/externalHosting'
import router from '@/router'

const axiosIns = axios.create({
  withCredentials: true,
  baseURL:
    import.meta.env.MODE === 'development'
      ? 'http://localhost:3000'
      : externalHosting.backend,
  timeout: 5000,
  headers: {
    'X-Custom-Header': 'Webpanel',
    'Access-Control-Allow-Origin': '*',
  },
})

axiosIns.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response.status === 401) {
      router.push({ name: 'auth-login' })
    }
    return Promise.reject(error)
  }
)

export default axiosIns
