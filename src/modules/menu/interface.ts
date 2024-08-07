export interface ICreateAndUpdateMenu {
  code: string;
  level: number;
  name: string;
  pid: number;
  id: number;
  createTime: string;
  updateTime: string;
  toCode: string;
  type: number;
  status: null;
  select?: boolean;
  children: ICreateAndUpdateMenu[];
}
