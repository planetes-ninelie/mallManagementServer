import { ApiProperty } from '@nestjs/swagger';

export class CreateOrUpdateAttr{
  @ApiProperty({ type: String, description: '属性名称', default: '颜色', required: true })
  attrName: string;
  @ApiProperty({ type: Array, description: '属性值数组对象', default: [{ id: 0, valueName: '红色' }] ,required: true })
  attrValueList: AttrValueList[];
  @ApiProperty({ type: Number, description: '分类id', default: 3, required: true })
  categoryId: number;
  @ApiProperty({ type: Number, description: '分类等级', default: 3, required: false })
  categoryLevel: number;
  @ApiProperty({ type: Number, description: '属性id', required: false })
  id?: number;

  createTime?: null;
  updateTime?: null;
}

export class AttrValueList{
  @ApiProperty({ type: Number, description: '属性值id', required: false })
  id?: number;
  createTime?: null;
  updateTime?: null;
  @ApiProperty({ type: String, description: '属性值名称', default: '红色', required: true })
  valueName: string;
  attrId?: number;

  // 前端传递的无用属性
  flag?: boolean;
}

export interface ICreateOrUpdateAttr extends CreateOrUpdateAttr{}

export interface IAttrValueList extends AttrValueList{}