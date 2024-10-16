export class SkuInfo {
  // category3Id: number;
  spuId: number;
  tmId: number;
  skuName: string;
  price: string;
  weight: string;
  skuDesc: string;
  skuAttrValueList: SkuAttrValueList[];
  skuSaleAttrValueList: SkuSaleAttrValueList[];
  skuDefaultImg: number;
}
export class SkuImageList {
  isDefault?: string;
  spuImgId: number;
}

export class SkuSaleAttrValueList {
  saleAttrId: string;
  saleAttrValueId: string;
}

export class SkuAttrValueList {
  attrId: string;
  valueId: string;
}

export interface ISkuInfo extends SkuInfo{}
