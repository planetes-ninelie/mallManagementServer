export class UploadEntity {
  id?: number;
  name: string;
  url: string;
  hash: string;
  createTime?: string;
  updateTime?: string;
}

export interface IUploadEntity extends UploadEntity {}

