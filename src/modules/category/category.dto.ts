import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto{
  @ApiProperty({ type: String, description: '分类名称', default: '手机', required: true })
  name:number
  @ApiProperty({ type: Number, description: '分类父id,一级分类的pid为0', default: 0, required: true })
  pid:number
  @ApiProperty({ type: Number, description: '分类水平，一共有1/2/3级,1为最高级', default: 1, required: true })
  level:number
}
export class UpdateCategoryDto {
  @ApiProperty({ type: String, description: '分类名称', default: '手机', required: true })
  name:number
  @ApiProperty({type: Number, description: '分类id',default: 1, required: true })
  id:number
}

export interface ICreateCategoryDto extends CreateCategoryDto {}
export interface IUpdateCategoryDto extends UpdateCategoryDto {}
