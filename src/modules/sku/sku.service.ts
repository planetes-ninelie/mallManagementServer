import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Sku } from '@prisma/client';
import { successList } from '../../utils/response';
import { ISkuInfo } from './sku.dto';
import { formatDateTime } from '../../utils';

@Injectable()
export class SkuService {
  constructor(private readonly prisma: PrismaService) {
  }

  /**
   * 新增sku
   * @param skuInfo sku信息
   * @returns 新增sku信息
   */
  async saveSkuInfo(skuInfo: ISkuInfo): Promise<> {
    const findName = await this.findByName(skuInfo.skuName)
    if (findName) {
      throw new HttpException('sku名称重复！',HttpStatus.OK)
    }
    if (!skuInfo.skuName) {
      throw new HttpException('sku名称不存在！',HttpStatus.OK)
    }
    if (!skuInfo.price) {
      throw new HttpException('sku价格不存在！',HttpStatus.OK)
    }
    if (!skuInfo.skuDefaultImg) {
      throw new HttpException('sku默认图片不存在！',HttpStatus.OK)
    }
    const data = await this.prisma.sku.create({
      data: {
        skuName:skuInfo.skuName,
        // 价格和重量转成数值
        price: parseFloat(skuInfo.price) || null,
        weight: parseFloat(skuInfo.weight) || null,
        skuDesc: skuInfo.skuDesc,
        imageId: skuInfo.skuDefaultImg,
        isSale: 0,
        spuId: skuInfo.spuId,
      },
    });

    const createAttributeValueObjects = (list) =>
      list.map(item => ({ attrValueId: parseFloat(item.valueId), skuId:data.id }));
    const skuAttrValues = createAttributeValueObjects(skuInfo.skuAttrValueList);
    const skuSaleAttrValues = createAttributeValueObjects(skuInfo.skuSaleAttrValueList);
    await this.prisma.SkuAttrValue.createMany({
      data: [...skuAttrValues, ...skuSaleAttrValues]
    });
    return data
  }

  /**
   * 获取sku列表
   * @param pageNum
   * @param pageSize
   */
  async findSkuList(pageNum: number, pageSize: number) {
    const { skuList, count } = await this.prisma.$transaction(async (prisma) => {
      return {
        skuList: await prisma.sku.findMany({
          skip: (pageNum - 1) * pageSize,
          take: pageSize,
          orderBy: {
            createTime: 'desc',
          },
          include: {
            image: true
          }
        }),
        count: await prisma.sku.count(),
      };
    });
    const newSkuList = skuList.map(item => ({
      ...item,
      skuDefaultImg: item.image.url
    }))

    // 返回分页信息和查询结果
    return successList<Sku>(newSkuList, { pageNum, pageSize, count });
  }


  /**
   * 上下架
   * @param skuId
   * @param num
   */
  isSale(skuId: number,num:number) {
    return this.prisma.sku.update({
      where: {
        id: skuId
      },
      data: {
        isSale: num
      },
    });
  }

  /**
   * 删除sku
   * @param id
   */
  async deleteSku(id: number) {
    await this.prisma.skuAttrValue.deleteMany({
      where: {
        skuId:id
      }
    })
    return this.prisma.sku.delete({
      where: {
        id
      },
    });
  }

  async deleteSkuBySpuId(spuId: number) {
    const skus = await this.findBySpuId(spuId)
    const skuIds = skus.map(item => item.id)
    await this.prisma.skuAttrValue.deleteMany({
      where: {
        skuId:{
          in:skuIds
        }
      }
    })
    return this.prisma.sku.deleteMany({
      where: {
        spuId
      },
    });
  }

  /**
   * 获取sku详情
   * @param skuId sku id
   * @returns sku详情
   */
  async getSkuInfo(skuId: number) {
    // 1. 根据skuId查询sku信息
    const { attrValues,createTime,updateTime, image, ...rest } = await this.prisma.sku.findUnique({
      where: { id: skuId },
      include: {
        image:true,
        spu: true,
        attrValues: {
          include: {
            attrValue: {
              include: {
                attr:true
              }
            }
          }
        }
      },
    });
    function AttrValue(type) {
      const filterAttrValue = attrValues.filter(item => item.attrValue.attr.type === type)
      return filterAttrValue.map(item => ({
        ...(item.attrValue)
      }))
    }
    const skuAttrValueList = AttrValue(1)
    const skuSaleAttrValueList = AttrValue(2)
    const createTimeFormat = formatDateTime(createTime)
    const updateTimeFormat = formatDateTime(updateTime)
    const skuImageList = [{
      imgUrl: image.url,
      ...image
    }]
    return {
      skuImageList,
      skuAttrValueList,
      skuSaleAttrValueList,
      createTime:createTimeFormat,
      updateTime:updateTimeFormat,
      ...rest,
    };
  }

  /**
   * 根据sku名称查询
   * @param skuName
   * @private
   */
  private findByName(skuName: string) {
    return this.prisma.sku.findFirst({
      where: {
        skuName
      }
    })
  }

  private findBySpuId(spuId: number) {
    return this.prisma.sku.findMany({
      where: {
        spuId
      }
    })
  }
}