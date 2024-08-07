import { SaleAttr, Spu, SpuImg } from '@prisma/client';

export interface SkuInfo {
  category3Id: number;
  spuId: number;
  tmId: number;
  skuName: string;
  price: string;
  weight: string;
  skuDesc: string;
  skuAttrValueList: SkuAttrValueList[];
  skuSaleAttrValueList: SkuSaleAttrValueList[];
  skuImageList: SkuImageList[];
  skuDefaultImg: string;
}

interface SkuImageList {
  isDefault?: string;
  spuImgId: number;
}

interface SkuSaleAttrValueList {
  saleAttrId: string;
  saleAttrValueId: string;
}

interface SkuAttrValueList {
  attrId: string;
  valueId: string;
}

// spu
export interface SpuInfo extends Spu {
  category3Id: number;
  spuImageList: SpuImg[];
  spuSaleAttrList: SpuSaleAttrList[];
}

interface SpuSaleAttrList extends SaleAttr {
  spuSaleAttrValueList: SpuSaleAttrValueList[];
}

interface SpuSaleAttrValueList {
  baseSaleAttrId: string;
  saleAttrValueName: string;
}

// 分类
export interface ICreateCategory {
  name: string;
  pid: number;
}

export interface ICreateOrUpdateAttr {
  attrName: string;
  attrValueList: AttrValueList[];
  categoryId: number;
  categoryLevel: number;
  id?: number;
  createTime?: null;
  updateTime?: null;
}

// 属性
interface AttrValueList {
  id?: number;
  createTime?: null;
  updateTime?: null;
  valueName: string;
  attrId?: number;

  // 前端传递的无用属性
  flag?: boolean;
}
