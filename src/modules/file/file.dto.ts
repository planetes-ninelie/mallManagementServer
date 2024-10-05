import { ApiProperty } from '@nestjs/swagger';

export class updateTidDto {
  @ApiProperty({ type: Number, description: '图片上传类型，1为用户头像，2为品牌图标，3为Spu图标',default: 2, required: true })
  type:number
  @ApiProperty({type:Number,description:'对应类型表中的id',default:1, required: true})
  tid:number
  @ApiProperty({type:String,description:'图片url',default:'',required: true})
  logoUrl:string
  // @ApiProperty({type:Number,description:'图片id',default:1, required: true})
  // imageId:number
}

export interface IUpdateTidDto extends updateTidDto {

}