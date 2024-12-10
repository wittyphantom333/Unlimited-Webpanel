import { createRouter, createWebHistory } from 'vue-router'
import { canNavigate } from '@libs/acl/routeProtection'
import jwt from '../@core/auth/jwt/useJwt'
import { isUserLoggedIn } from '@core/auth/utils'
import pinia from '../stores/store'
import { useUserStore } from '@stores/user'
import { useAppStore } from '@stores/app'
import { useListsStore } from '@stores/lists'
import { ACTION, RESOURCE } from '../../../common/permissions'
import { externalHosting } from '../../../common/externalHosting'

const userStore = useUserStore(pinia)
const appStore = useAppStore(pinia)
const listsStore = useListsStore(pinia)

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      resource: RESOURCE.APP,
      action: ACTION.APP.DASHBOARD,
      breadcrumb: [
        {
          text: 'dashboard',
        },
      ],
    },
  },
  // GAME SECTION
  {
    path: '/game/map',
    name: 'game-live-map',
    component: () => import('@/views/game/map/LiveMap.vue'),
    meta: {
      resource: RESOURCE.GAME,
      action: ACTION.GAME.LIVEMAP.READ,
      breadcrumb: [
        {
          text: 'map',
        },
      ],
    },
  },
  {
    path: '/game/waypoints',
    name: 'game-waypoint-list',
    component: () => import('@/views/game/waypoint/WaypointList.vue'),
    meta: {
      resource: RESOURCE.GAME,
      action: ACTION.GAME.WAYPOINT.READ,
      breadcrumb: [
        {
          text: 'waypoints',
        },
      ],
    },
    children: [
      {
        path: ':waypointId',
        name: 'game-waypoint-detail',
        props: true,
        component: () => import('@/views/game/waypoint/Waypoint.vue'),
        meta: {
          resource: RESOURCE.GAME,
          action: ACTION.GAME.WAYPOINT.READ,
          breadcrumb: [
            {
              text: 'waypoints',
              to: { name: 'game-waypoint-list' },
            },
            {
              text: 'waypoint',
              active: true,
            },
          ],
        },
      },
      {
        path: 'create',
        name: 'game-waypoint-create',
        props: true,
        component: () => import('@/views/game/waypoint/WaypointCreate.vue'),
        meta: {
          resource: RESOURCE.GAME,
          action: ACTION.GAME.WAYPOINT.CREATE,
          breadcrumb: [
            {
              text: 'waypoints',
              to: { name: 'game-waypoint-list' },
            },
            {
              text: 'waypoint',
              active: true,
            },
          ],
        },
      },
    ],
  },
  {
    path: '/game/accounts',
    name: 'game-account-list',
    component: () => import('@/views/game/account/AccountList.vue'),
    meta: {
      resource: RESOURCE.GAME,
      action: ACTION.GAME.ACCOUNT.READ,
      sortBy: 'name',
      breadcrumb: [
        {
          text: 'accounts',
        },
      ],
    },
    children: [
      {
        path: ':license',
        name: 'game-account-detail',
        props: true,
        component: () => import('@/views/game/account/Account.vue'),
        meta: {
          resource: RESOURCE.GAME,
          action: ACTION.GAME.ACCOUNT.READ,
          breadcrumb: [
            {
              text: 'accounts',
              to: { name: 'game-account-list' },
            },
            {
              text: 'account',
              active: true,
            },
          ],
        },
      },
    ],
  },
  {
    path: '/game/players',
    name: 'game-player-list',
    component: () => import('@/views/game/player/PlayerList.vue'),
    meta: {
      resource: RESOURCE.GAME,
      action: ACTION.GAME.PLAYER.READ,
      sortBy: 'firstname',
      breadcrumb: [
        {
          text: 'players',
        },
      ],
    },
    children: [
      {
        path: ':citizenid',
        name: 'game-player-detail',
        props: true,
        component: () => import('@/views/game/player/Player.vue'),
        meta: {
          resource: RESOURCE.GAME,
          action: ACTION.GAME.PLAYER.READ,
          breadcrumb: [
            {
              text: 'players',
              to: { name: 'game-player-list' },
            },
            {
              text: 'player',
              active: true,
            },
          ],
        },
        children: [
          {
            path: 'inventory',
            name: 'game-player-inventory',
            props: true,
            component: () => import('@/views/game/player/Inventory.vue'),
            meta: {
              resource: RESOURCE.GAME,
              action: ACTION.GAME.PLAYER.READ,
              breadcrumb: [
                {
                  text: 'players',
                  to: { name: 'game-player-list' },
                },
                {
                  text: 'player',
                  to: { name: 'game-player-detail' },
                },
                {
                  text: 'inventory',
                  active: true,
                },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    path: '/game/vehicles',
    name: 'game-vehicle-list',
    component: () => import('@/views/game/vehicle/VehicleList.vue'),
    meta: {
      resource: RESOURCE.GAME,
      action: ACTION.GAME.VEHICLE.READ,
      sortBy: 'plate',
      breadcrumb: [
        {
          text: 'vehicles',
        },
      ],
    },
    children: [
      {
        path: ':vehicleId',
        name: 'game-vehicle-detail',
        props: true,
        component: () => import('@/views/game/vehicle/Vehicle.vue'),
        meta: {
          resource: RESOURCE.GAME,
          action: ACTION.GAME.VEHICLE.READ,
          breadcrumb: [
            {
              text: 'vehicles',
              to: { name: 'game-vehicle-list' },
            },
            {
              text: 'vehicle',
              active: true,
            },
          ],
        },
      },
      {
        path: 'create',
        name: 'game-vehicle-create',
        props: true,
        component: () => import('@/views/game/vehicle/VehicleCreate.vue'),
        meta: {
          resource: RESOURCE.GAME,
          action: ACTION.GAME.VEHICLE.CREATE,
          breadcrumb: [
            {
              text: 'vehicles',
              to: { name: 'game-vehicle-list' },
            },
            {
              text: 'vehicle',
              active: true,
            },
          ],
        },
      },
    ],
  },
  {
    path: '/game/stashes',
    name: 'game-stashes-list',
    component: () => import('@/views/game/stashes/StashesList.vue'),
    meta: {
      resource: RESOURCE.GAME,
      action: ACTION.GAME.STASHES.READ,
      breadcrumb: [
        {
          text: 'stashes',
        },
      ],
    },
    children: [
      {
        path: ':stashId',
        name: 'game-stashes-detail',
        props: true,
        component: () => import('@/views/game/stashes/Stash.vue'),
        meta: {
          resource: RESOURCE.GAME,
          action: ACTION.GAME.STASHES.READ,
          breadcrumb: [
            {
              text: 'stashes',
              to: { name: 'game-stashes-list' },
            },
            {
              text: 'stash',
              active: true,
            },
          ],
        },
      },
    ],
  },
  {
    path: '/game/logs',
    name: 'game-logs',
    component: () => import('@/views/game/logs/Logs.vue'),
    meta: {
      resource: RESOURCE.GAME,
      action: ACTION.GAME.LOGS.READ,
      breadcrumb: [
        {
          text: 'logs',
        },
      ],
    },
  },
  // DEV SECTION
  {
    path: '/dev/items',
    name: 'dev-item-list',
    component: () => import('@/views/dev/item/ItemList.vue'),
    meta: {
      resource: RESOURCE.DEV,
      action: ACTION.DEV.ITEM.READ,
      breadcrumb: [
        {
          text: 'items',
        },
      ],
    },
    children: [
      {
        path: ':itemId',
        name: 'dev-item-detail',
        props: true,
        component: () => import('@/views/dev/item/Item.vue'),
        meta: {
          resource: RESOURCE.DEV,
          action: ACTION.DEV.ITEM.READ,
          breadcrumb: [
            {
              text: 'items',
              to: { name: 'dev-item-list' },
            },
            {
              text: 'item',
              active: true,
            },
          ],
        },
      },
      {
        path: 'create',
        name: 'dev-item-create',
        props: true,
        component: () => import('@/views/dev/item/ItemCreate.vue'),
        meta: {
          resource: RESOURCE.DEV,
          action: ACTION.DEV.ITEM.CREATE,
          breadcrumb: [
            {
              text: 'items',
              to: { name: 'dev-item-list' },
            },
            {
              text: 'item',
              active: true,
            },
          ],
        },
      },
    ],
  },
  {
    path: '/dev/jobs',
    name: 'dev-job-list',
    component: () => import('@/views/dev/job/JobList.vue'),
    meta: {
      resource: RESOURCE.DEV,
      action: ACTION.DEV.JOB.READ,
      breadcrumb: [
        {
          text: 'jobs',
        },
      ],
    },
    children: [
      {
        path: ':jobId',
        name: 'dev-job-detail',
        props: true,
        component: () => import('@/views/dev/job/Job.vue'),
        meta: {
          resource: RESOURCE.DEV,
          action: ACTION.DEV.JOB.READ,
          breadcrumb: [
            {
              text: 'jobs',
              to: { name: 'dev-job-list' },
            },
            {
              text: 'job',
              active: true,
            },
          ],
        },
      },
      {
        path: 'create',
        name: 'dev-job-create',
        props: true,
        component: () => import('@/views/dev/job/JobCreate.vue'),
        meta: {
          resource: RESOURCE.DEV,
          action: ACTION.DEV.JOB.CREATE,
          breadcrumb: [
            {
              text: 'jobs',
              to: { name: 'dev-job-list' },
            },
            {
              text: 'job',
              active: true,
            },
          ],
        },
      },
    ],
  },
  {
    path: '/dev/gangs',
    name: 'dev-gang-list',
    component: () => import('@/views/dev/gang/GangList.vue'),
    meta: {
      resource: RESOURCE.DEV,
      action: ACTION.DEV.GANG.READ,
      breadcrumb: [
        {
          text: 'gangs',
        },
      ],
    },
    children: [
      {
        path: ':gangId',
        name: 'dev-gang-detail',
        props: true,
        component: () => import('@/views/dev/gang/Gang.vue'),
        meta: {
          resource: RESOURCE.DEV,
          action: ACTION.DEV.GANG.READ,
          breadcrumb: [
            {
              text: 'gangs',
              to: { name: 'dev-gang-list' },
            },
            {
              text: 'gang',
              active: true,
            },
          ],
        },
      },
      {
        path: 'create',
        name: 'dev-gang-create',
        props: true,
        component: () => import('@/views/dev/gang/GangCreate.vue'),
        meta: {
          resource: RESOURCE.DEV,
          action: ACTION.DEV.GANG.CREATE,
          breadcrumb: [
            {
              text: 'gangs',
              to: { name: 'dev-gang-list' },
            },
            {
              text: 'gang',
              active: true,
            },
          ],
        },
      },
    ],
  },
  {
    path: '/dev/vehicles',
    name: 'dev-vehicle-list',
    component: () => import('@/views/dev/vehicle/VehicleList.vue'),
    meta: {
      resource: RESOURCE.DEV,
      action: ACTION.DEV.VEHICLE.READ,
      breadcrumb: [
        {
          text: 'vehicles',
        },
      ],
    },
    children: [
      {
        path: ':vehicleId',
        name: 'dev-vehicle-detail',
        props: true,
        component: () => import('@/views/dev/vehicle/Vehicle.vue'),
        meta: {
          resource: RESOURCE.DEV,
          action: ACTION.DEV.VEHICLE.READ,
          breadcrumb: [
            {
              text: 'vehicles',
              to: { name: 'dev-vehicle-list' },
            },
            {
              text: 'vehicle',
              active: true,
            },
          ],
        },
      },
      {
        path: '/create',
        name: 'dev-vehicle-create',
        props: true,
        component: () => import('@/views/dev/vehicle/VehicleCreate.vue'),
        meta: {
          resource: RESOURCE.DEV,
          action: ACTION.DEV.VEHICLE.CREATE,
          breadcrumb: [
            {
              text: 'vehicles',
              to: { name: 'dev-vehicle-list' },
            },
            {
              text: 'vehicle',
              active: true,
            },
          ],
        },
      },
    ],
  },
  // WEB SECTION
  {
    path: '/web/users',
    name: 'web-user-list',
    component: () => import('@/views/management/user/UserList.vue'),
    meta: {
      resource: RESOURCE.WEB,
      action: ACTION.WEB.USER.READ,
      breadcrumb: [
        {
          text: 'users',
        },
      ],
    },
    children: [
      {
        path: ':userId',
        name: 'web-user-detail',
        props: true,
        component: () => import('@/views/management/user/User.vue'),
        meta: {
          resource: RESOURCE.WEB,
          action: ACTION.WEB.USER.READ,
          breadcrumb: [
            {
              text: 'users',
              to: { name: 'web-user-list' },
            },
            {
              text: 'user',
              active: true,
            },
          ],
        },
      },
      {
        path: 'create',
        name: 'web-user-create',
        props: true,
        component: () => import('@/views/management/user/UserCreate.vue'),
        meta: {
          resource: RESOURCE.WEB,
          action: ACTION.WEB.USER.CREATE,
          breadcrumb: [
            {
              text: 'users',
              to: { name: 'web-user-list' },
            },
            {
              text: 'user',
              active: true,
            },
          ],
        },
      },
    ],
  },
  {
    path: '/web/roles',
    name: 'web-role-list',
    component: () => import('@/views/management/role/RoleList.vue'),
    meta: {
      resource: RESOURCE.WEB,
      action: ACTION.WEB.ROLE.READ,
      breadcrumb: [
        {
          text: 'roles',
        },
      ],
    },
    children: [
      {
        path: ':roleId',
        name: 'web-role-detail',
        props: true,
        component: () => import('@/views/management/role/Role.vue'),
        meta: {
          resource: RESOURCE.WEB,
          action: ACTION.WEB.ROLE.READ,
          breadcrumb: [
            {
              text: 'roles',
              to: { name: 'web-role-list' },
            },
            {
              text: 'role',
              active: true,
            },
          ],
        },
      },
      {
        path: 'create',
        name: 'web-role-create',
        props: true,
        component: () => import('@/views/management/role/RoleCreate.vue'),
        meta: {
          resource: RESOURCE.WEB,
          action: ACTION.WEB.ROLE.CREATE,
          breadcrumb: [
            {
              text: 'roles',
              to: { name: 'web-role-list' },
            },
            {
              text: 'role',
              active: true,
            },
          ],
        },
      },
    ],
  },
  {
    path: '/web/config',
    name: 'web-config',
    component: () => import('@/views/management/config/Configuration.vue'),
    meta: {
      resource: RESOURCE.WEB,
      action: ACTION.WEB.CONFIG.READ,
      breadcrumb: [
        {
          text: 'config',
        },
      ],
    },
  },
  // GENERAL SECTION
  {
    path: '/error-404',
    name: 'error-404',
    component: () => import('@/views/error/Error404.vue'),
    meta: {
      layout: 'full',
      resource: RESOURCE.GENERAL,
      action: ACTION.GENERAL.AUTH,
    },
  },
  {
    path: '/error-authorized',
    name: 'misc-not-authorized',
    component: () => import('@/views/error/NotAuthorized.vue'),
    meta: {
      layout: 'full',
      resource: RESOURCE.GENERAL,
      action: ACTION.GENERAL.AUTH,
    },
  },
  {
    path: '/login',
    name: 'auth-login',
    component: () => import('@/views/Login.vue'),
    meta: {
      layout: 'full',
      resource: RESOURCE.GENERAL,
      action: ACTION.GENERAL.AUTH,
      redirectIfLoggedIn: true,
    },
  },
  {
    path: '/auth/:provider/callback',
    name: 'auth-callback',
    component: () => import('@/views/Auth.vue'),
    meta: {
      layout: 'full',
      resource: RESOURCE.GENERAL,
      action: ACTION.GENERAL.AUTH,
      redirectIfLoggedIn: true,
    },
  },
  {
    path: '/setup',
    name: 'setup',
    component: () => import('@/views/Setup.vue'),
    meta: {
      layout: 'full',
      resource: RESOURCE.GENERAL,
      action: ACTION.GENERAL.AUTH,
    },
  },
  {
    path: '/:catchAll(.*)',
    redirect: 'error-404',
  },
]

const router = createRouter({
  history: externalHosting.webHistory
    ? createWebHistory(externalHosting.webHistory)
    : createWebHistory(),
  base: externalHosting.isSubPath
    ? externalHosting.isSubPath
    : import.meta.env.BASE_URL,
  routes,
})

router.beforeEach(async (to, _, next) => {
  let isLoggedIn = isUserLoggedIn()

  if (appStore.setupMode && to.name !== 'setup') {
    return next({ name: 'setup' })
  }

  // handle list search reset
  const match = to.matched.some(route => route.name === listsStore.lastList)
  if (!match) {
    listsStore.$reset()
    listsStore.lastList = to.name
    listsStore.paginationSave.sortBy = to.meta.sortBy || 'desc'
  }

  // not logged in
  if (!isLoggedIn) {
    // check if refresh token is present on sv
    if (!jwt.isAlreadyFetchingAccessToken) {
      jwt.isAlreadyFetchingAccessToken = true
      await jwt.refreshToken().then(r => {
        if (!r.data.accessToken || !r.data.userData) return
        isLoggedIn = true

        jwt.isAlreadyFetchingAccessToken = false

        // Update accessToken / userData in store
        jwt.setToken(r.data.accessToken)
        userStore.UPDATE_USER_DATA(r.data.userData)

        jwt.onAccessTokenFetched(r.data.accessToken)
      })
    }
  }

  if (!canNavigate(to)) {
    // Redirect to login if not logged in
    if (!isLoggedIn) return next({ name: 'auth-login' })

    // If logged in => not authorized
    return next({ name: 'misc-not-authorized' })
  }

  return next()
})

router.afterEach(() => {
  // Remove initial loading
  const appLoading = document.getElementById('loading-bg')
  if (appLoading) {
    appLoading.style.display = 'none'
  }
})

export default router
