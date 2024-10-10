import { ApiProperty } from '@nestjs/swagger';

export class UploadDto {
  @ApiProperty({ type: String, description: '图片url', default: '', required: true })
  url:string
}
export interface IUploadDto extends UploadDto {}