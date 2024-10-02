import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ type: String, description: '菜单名称',default: 'example', required: true })
  name: string;
  @ApiProperty({ type: Number, description: '菜单的父菜单id，默认为1',default: 1, required: false })
  pid?: number;
  @ApiProperty({ type: Number, description: '菜单类型，菜单为1，按钮为2',default: 1, required: false })
  type?: number;
  @ApiProperty({ type: Number, description: '菜单的等级',default: 2, required: false })
  level?: number;
  @ApiProperty({ type: String, description: '菜单权限值',default: '', required: false })
  code?: string;
}

export class UpdateMenuDto extends CreateMenuDto {
  @ApiProperty({ type: Number, description: '菜单id',default: 2, required: true })
  id: number;
}

export class doAssignDto {
  roleId: number;
  permissionIdList: number[];
}

export interface ICreateMenuDto extends CreateMenuDto {}
export interface IUpdateMenuDto extends UpdateMenuDto {}
export interface IDoAssignDto extends doAssignDto {}