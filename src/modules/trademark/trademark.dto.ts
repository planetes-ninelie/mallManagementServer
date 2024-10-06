import { ApiProperty } from '@nestjs/swagger';

export class TrademarkDto {
  id?: number;
  @ApiProperty({ type: String, description: '品牌名称', default: '华为', required: true })
  tmName: string;
  @ApiProperty({ type: String, description: '图标url', default: 'https://pic.imgdb.cn/item/66b46ba3d9c307b7e9c2cfaa.jpg', required: true })
  logoUrl: string;
}

export interface ITrademarkDto extends TrademarkDto {}
