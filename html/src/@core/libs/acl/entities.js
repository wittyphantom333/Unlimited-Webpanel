class Entity {
  constructor(attrs) {
    Object.assign(this, attrs)
  }
}

export class User extends Entity {}
export class Role extends Entity {}
