export class UploadEntity {
  id?: number;
  name: string;
  url: string;
  type: number;
  tid?: number;
  hash: string;
  createTime?: string;
  updateTime?: string;
}

export interface IUploadEntity extends UploadEntity {}
