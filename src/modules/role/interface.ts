export interface ICreateRole {
  id?: number;
  roleName: string;
}

export interface IUpdateRole {
  roleName: string;
  id: number;
  createTime?: string;
  updateTime?: string;
  remark?: null;
}

export interface IQueryRole {
  roleName: string;
}
