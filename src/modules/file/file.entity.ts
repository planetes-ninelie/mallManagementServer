export class ImageRelationEntity {
  id?: number;
  type: number;
  tid: number;
  imageId: number;
  createTime?: string;
}

export interface IImageRelationEntity extends ImageRelationEntity {}