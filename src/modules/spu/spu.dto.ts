import { ApiProperty } from '@nestjs/swagger';

export class CreateSpuDTO {
  @ApiProperty({type: Number,description:'spu的id', default: null, required:false})
  id?:number
  @ApiProperty({ type: String, description: 'spu名称', default: '华为', required: true })
  spuName:string
  @ApiProperty({ type: String, description: 'spu描述', default: '华为生产手机', required: false })
  description:string
  @ApiProperty({ type: Number, description: 'spu所属的三级分类id', default: 1, required: true })
  categoryId:number
  @ApiProperty({ type: Number, description: 'spu所属的品牌id', default: 1, required: true })
  tmId:number
  @ApiProperty({ type: [], description: 'spu所属图片url列表', required: false })
  spuImageList:string[]
  @ApiProperty({ type: [], description: 'spu的属性id列表', required: false })
  attrs:number[]
  @ApiProperty({ type: [], description: 'spu的属性值id列表', required: false })
  attrValues:number[]
}

export interface ICreateSpuDTO extends CreateSpuDTO {}