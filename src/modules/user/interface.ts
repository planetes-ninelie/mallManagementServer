export interface ICreateUser {
  id?: number;
  username: string;
  password: string;
  name: string;
}

export interface IUpdateUser {
  id: number;
  username: string;
  name: string;
  createTime?: string;
  updateTime?: string;
  password?: string;
  phone?: string;
  roleName?: string;
}

export interface IQueryUser {
  username: string;
}
