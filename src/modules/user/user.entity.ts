import { Role } from '../role/role.entity';

export class User {
  id: number;
  createTime: string;
  updateTime: string;
  username: string;
  name: string;
  phone: string;
  password?: string;
}

export class UserRoleEntity extends User{
  roles: Role[]
}
