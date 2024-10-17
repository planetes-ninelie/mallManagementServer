import { ApiProperty } from '@nestjs/swagger';

export class SkuInfo {
  @ApiProperty({type: Number,description:'spu的id', default: 0, required:true})
  spuId: number;
  @ApiProperty({type: Number,description:'品牌的id(原接口要带的参数，先用不着但还是随便传个数)', default: null, required:false})
  tmId: number;
  @ApiProperty({type: String,description:'sku名称', default: '', required:false})
  skuName: string;
  @ApiProperty({type: Number,description:'sku的价格', default: 0, required:false})
  price: string;
  @ApiProperty({type: Number,description:'sku的重量', default: 0, required:false})
  weight: string;
  @ApiProperty({type: String,description:'sku描述', default: '', required:false})
  skuDesc: string;
  @ApiProperty({type: [],description:'sku销售属性和属性值列表', default: [{attrId:"0",valueId:"0"}], required:false})
  skuAttrValueList: SkuAttrValueList[];
  @ApiProperty({type: [],description:'sku平台属性和属性值列表', default: [{saleAttrId:"0",saleAttrValueId:"0"}], required:false})
  skuSaleAttrValueList: SkuSaleAttrValueList[];
  @ApiProperty({type: String,description:'sku的默认图片url', default: '', required:true})
  skuDefaultImg: number;
}
export class UpdateSkuInfo extends SkuInfo {
  @ApiProperty({type: Number,description:'sku的id', default: 0, required:true})
  id: number;
}

export class SkuSaleAttrValueList {
  @ApiProperty({type: Number,description:'销售属性的id', default: 0, required:false})
  saleAttrId: string;
  @ApiProperty({type: Number,description:'销售属性值的id', default: 0, required:false})
  saleAttrValueId: string;
}

export class SkuAttrValueList {
  @ApiProperty({type: Number,description:'平台属性的id', default: 0, required:false})
  attrId: string;
  @ApiProperty({type: Number,description:'平台属性值的id', default: 0, required:false})
  valueId: string;
}

export interface ISkuInfo extends SkuInfo{}
export interface IUpdateSkuInfo extends UpdateSkuInfo{}