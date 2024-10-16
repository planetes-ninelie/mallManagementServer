import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttrService } from '../attr/attr.service';
import { ICreateSpuDTO } from './spu.dto';
import { FileService } from '../file/file.service';
import { IUpdateTidDto } from '../file/file.dto';
import { successList } from '../../utils/response';
import { Spu } from '@prisma/client';
import { SkuService } from '../sku/sku.service';

@Injectable()
export class SpuService {
  constructor(private readonly prisma : PrismaService,
              private readonly attrService: AttrService,
              private readonly fileService: FileService,
              private readonly skuService: SkuService,) {
  }

  /**
   * 删除spu
   * @param id
   */
  async deleteSpu(id: number) {
    await this.prisma.spuAttr.deleteMany({
      where: {
        spuId: id
      }
    });
    await this.prisma.spuAttrValue.deleteMany({
      where: {
        spuId: id
      }
    })
    const imageList = await this.prisma.spuImage.findMany({
      where: {
        spuId: id
      }
    })
    await this.prisma.spuImage.deleteMany({
      where: {
        spuId: id
      }
    })
    await this.skuService.deleteSkuBySpuId(id)
    for (const image of imageList) {
      const data = {
        type:3,
        tid: id,
        imageId:image.id
      }
      const imageRelation = await this.fileService.selectImageRelation(data)
      await this.fileService.removeImageRelation(imageRelation.id)
    }

    return this.prisma.spu.delete({
      where: {
        id
      },
    });
  }

  /**
   * 异步更新Spu信息
   * @param spuInfo - 包含SpuInfo数据的对象，其中id为要更新的记录的ID，其他属性为要更新的数据
   * @returns 返回一个Promise，该Promise在事务完成后解析，包含删除和更新操作的结果
   */
  async updateSpuInfo(spuInfo: SpuInfo) {
    // 解构出id和其余信息
    const { id, ...info } = spuInfo;

    // 删除与该SPU关联的销售属性
    const deleteSaleAttr = this.prisma.saleAttr.deleteMany({
      where: {
        spuId: id,
      },
    });

    // 删除与该SPU关联的图片
    const deleteSpuImg = this.prisma.spuImg.deleteMany({
      where: {
        spuId: id,
      },
    });

    // 更新SPU信息，包括基础信息和图片、销售属性列表
    const updateSpu = this.prisma.spu.update({
      where: {
        id: id,
      },
      data: {
        ...info,
        spuImageList: {
          createMany: {
            data: spuInfo.spuImageList,
          },
        },
        spuSaleAttrList: {
          create: spuInfo.spuSaleAttrList.map((item) => {
            return {
              baseSaleAttrId: item.baseSaleAttrId,
              saleAttrName: item.saleAttrName,
              spuSaleAttrValueList: {
                create: item.spuSaleAttrValueList.map((item2) => {
                  return {
                    baseSaleAttrId: item2.baseSaleAttrId,
                    saleAttrValueName: item2.saleAttrValueName,
                  };
                }),
              },
            };
          }),
        },
      },
    });

    // 使用Prisma客户端的事务功能执行所有操作
    return await this.prisma.$transaction([deleteSaleAttr, deleteSpuImg, updateSpu]);
  }

  /**
   * 创建SPU
   * @returns 返回一个Promise，该Promise在事务完成后解析，包含创建的SPU数据
   * @param createSpuDTO
   */
  async saveSpuInfo(createSpuDTO:ICreateSpuDTO) {
    delete createSpuDTO.id
    delete createSpuDTO.createTime
    delete createSpuDTO.updateTime
    const isExistName = await this.selectSpuByName(createSpuDTO.spuName)
    const checkName = isExistName.length > 0
    if(checkName) {
      throw new HttpException(`spu名称 ${isExistName.spuName} 已存在！`,HttpStatus.OK)
    }
    if(!createSpuDTO.spuName) {
      throw new HttpException('请填写spu名称！',HttpStatus.OK)
    }
    if (!createSpuDTO.tmId) {
      throw new HttpException('请选择品牌！', HttpStatus.OK);
    }

    const { attrs,attrValues,spuImageList,...rest } = createSpuDTO;
    const spu = await this.prisma.spu.create({
      data: {
        ...rest
      },
    });
    await this.prisma.spuAttr.createMany({
      data:attrs.map(item => ({
        attrId: item,
        spuId: spu.id
      }))
    })
    await this.prisma.spuAttrValue.createMany({
      data:attrValues.map(item => ({
        attrValueId: item,
        spuId: spu.id
      }))
    })
    const promises = spuImageList.map(async item => {
      const data:IUpdateTidDto = {
        type: 3,
        tid: spu.id,
        logoUrl: item,
      }
      return this.fileService.addImageRelation(data);
    });
    const images = await Promise.all(promises);
    await this.prisma.spuImage.createMany({
      data: images.map(item => ({
        imageId: item.imageId,
        spuId: spu.id
      }))
    })
    return spu
  }

  /**
   * 获取spu列表
   * @param pageNum
   * @param pageSize
   * @param category3Id
   */
  async findSpuAll(pageNum: number, pageSize: number, category3Id: number) {
    const { spuList, count } = await this.prisma.$transaction(async (prisma) => {
      return {
        spuList: await prisma.spu.findMany({
          skip: (pageNum - 1) * pageSize, // 跳过指定数量的品牌以实现分页
          take: pageSize, // 返回指定数量的品牌
          where: {
            categoryId:category3Id,
          },
          orderBy: {
            createTime: 'desc',
          },
        }),
        count: await prisma.spu.count(), // 获取品牌总数
      };
    });

    // 返回分页信息和查询结果
    return successList<Spu>(spuList, { pageNum, pageSize, count });
  }

  // 查找spu下的sku列表
  async findBySpuId(id: number) {
    const skus = await this.prisma.sku.findMany({
      where: {
        spuId: id,
      },
      include: {
        image: true
      }
    });
    return skus.map(item => ({
      ...item,
      skuDefaultImg:item.image.url
    }))
  }

  /**
   * 查找spu的图片列表
   * @param id
   */
  async spuImageList(id: number) {
    const images = await this.prisma.spuImage.findMany({
      where: {
        spuId:id
      },
      select: {
        image:true
      }
    })
    return images.map(item => item.image)
  }

  /**
   * 查找spu属性和属性值列表
   * @param id
   */
  async spuSaleAttrList(id: number) {
    const attrs = await this.prisma.spuAttr.findMany({
      where: {
        spuId:id
      },
      select: {
        attr: true
      }
    })
    const attrValues = await this.prisma.spuAttrValue.findMany({
      where: {
        spuId:id
      },
      select: {
        attrValue: true
      }
    })
    const valueList = attrValues.map(({ attrValue }) => {
      return {
        saleAttrValueId: attrValue.id,
        saleAttrValueName: attrValue.valueName,
        attrId: attrValue.attrId
      }
    })
    return attrs.map(({attr}) => {
      return {
        saleAttrName: attr.attrName,
        baseSaleAttrId: attr.id,
        spuSaleAttrValueList: valueList.filter(item => item.attrId === attr.id)
      }
    })
  }

  /**
   * 根据spu名称查spu
   * @param spuName
   */
  selectSpuByName(spuName: string) {
    return this.prisma.spu.findMany({
      where:{
        spuName
      }
    })
  }
}