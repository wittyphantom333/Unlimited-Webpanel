const RESOURCE = {
  GENERAL: 'general',
  APP: 'app',
  GAME: 'game',
  DEV: 'dev',
  WEB: 'web',
}

const ACTION = {
  GENERAL: {
    AUTH: 'auth',
  },
  APP: {
    DASHBOARD: 'dashboard:read',
  },
  GAME: {
    LIVEMAP: {
      READ: 'livemap:read',
      PLAYER: 'livemap:player',
      VEHICLE: 'livemap:vehicle',
    },
    WAYPOINT: {
      READ: 'waypoint:read',
      MODIFY: 'waypoint:modify',
      DELETE: 'waypoint:delete',
      CREATE: 'waypoint:create',
    },
    ACCOUNT: {
      READ: 'account:read',
    },
    PLAYER: {
      READ: 'player:read',
      MODIFY: 'player:modify',
      DELETE: 'player:delete',
      KICK: 'player:kick',
      WARN: 'player:warn',
      BAN: 'player:ban',
      MONEY: 'player:money',
      META: 'player:meta',
      POSITION: 'player:position',
      INVENTORY: 'player:inventory',
      SCREEN: 'player:screen',
      LICENSE: 'player:license',
      GANG: 'player:gang',
      JOB: 'player:job',
    },
    STASHES: {
      READ: 'stashes:read',
      MODIFY: 'stashes:modify',
      DELETE: 'stashes:delete',
    },
    VEHICLE: {
      READ: 'vehicle:read',
      MODIFY: 'vehicle:modify',
      DELETE: 'vehicle:delete',
      CREATE: 'vehicle:create',
      DESPAWN: 'vehicle:despawn',
      REPAIR: 'vehicle:repair',
    },
    LOGS: {
      READ: 'logs:read',
      GAME: 'logs:game',
      PLAYER: 'logs:player',
      DEV: 'logs:dev',
      WEB: 'logs:web',
    },
  },
  DEV: {
    ITEM: {
      READ: 'item:read',
      MODIFY: 'item:modify',
      DELETE: 'item:delete',
      CREATE: 'item:create',
    },
    JOB: {
      READ: 'job:read',
      MODIFY: 'job:modify',
      DELETE: 'job:delete',
      CREATE: 'job:create',
    },
    GANG: {
      READ: 'gang:read',
      MODIFY: 'gang:modify',
      DELETE: 'gang:delete',
      CREATE: 'gang:create',
    },
    VEHICLE: {
      READ: 'vehicle:read',
      MODIFY: 'vehicle:modify',
      DELETE: 'vehicle:delete',
      CREATE: 'vehicle:create',
    },
  },
  WEB: {
    USER: {
      READ: 'user:read',
      MODIFY: 'user:modify',
      DELETE: 'user:delete',
      CREATE: 'user:create',
    },
    ROLE: {
      READ: 'role:read',
      MODIFY: 'role:modify',
      DELETE: 'role:delete',
      CREATE: 'role:create',
    },
    CONFIG: {
      READ: 'config:read',
      MODIFY: 'config:modify',
    },
  },
}

export { RESOURCE, ACTION }
