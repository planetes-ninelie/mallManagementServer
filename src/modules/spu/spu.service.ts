import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICreateSpuDTO } from './spu.dto';
import { FileService } from '../file/file.service';
import { IUpdateTidDto } from '../file/file.dto';
import { successList } from '../../utils/response';
import { Spu } from '@prisma/client';
import { SkuService } from '../sku/sku.service';
import { filterDuplicates } from '../../utils';

@Injectable()
export class SpuService {
  constructor(private readonly prisma : PrismaService,
              private readonly fileService: FileService,
              private readonly skuService: SkuService) {
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
  async updateSpuInfo(spuInfo: ICreateSpuDTO) {
    delete spuInfo.createTime
    delete spuInfo.updateTime

    const isExistName = await this.selectSpuByName(spuInfo.spuName)
    const checkName = isExistName.length > 1 || (isExistName.length === 1 && isExistName[0].id !== spuInfo.id)
    if(checkName) {
      throw new HttpException(`spu名称 ${isExistName.spuName} 已存在！`,HttpStatus.OK)
    }
    if(!spuInfo.spuName) {
      throw new HttpException('请填写spu名称！',HttpStatus.OK)
    }
    if(!spuInfo.tmId) {
      throw new HttpException('请选择品牌！', HttpStatus.OK);
    }
    const { attrs,attrValues,spuImageList,...rest } = spuInfo;
    const spu = this.prisma.spu.update({
      where: {
        id:spuInfo.id
      },
      data: {
        ...rest
      }
    })
    //处理spuAttr
    const isExistOfAttrs = await this.prisma.spuAttr.findMany({
      where: {
        spuId: spuInfo.id
      }
    })
    const isExistOfAttrIds = isExistOfAttrs.map(item => item.attrId)
    const addAttrs = filterDuplicates(isExistOfAttrIds,attrs)
    const deleteAttrs = filterDuplicates(attrs,isExistOfAttrIds)
    if (addAttrs.length > 0) {
      await this.prisma.spuAttr.createMany({
        data: addAttrs.map(item => ({
          attrId: item,
          spuId: spuInfo.id
        }))
      })
    }
    if (deleteAttrs.length > 0) {
      await this.prisma.spuAttr.deleteMany({
        where: {
          spuId: spuInfo.id,
          attrId: {
            in: deleteAttrs
          }
        }
      })
    }

    //处理spuAttrValue
    const isExistOfAttrValues = await this.prisma.spuAttrValue.findMany({
      where: {
        spuId: spuInfo.id
      }
    })
    const isExistOfAttrValuesIds = isExistOfAttrValues.map(item => item.attrValueId)
    const addAttrValues = filterDuplicates(isExistOfAttrValuesIds,attrValues)
    const deleteAttrValues = filterDuplicates(attrValues,isExistOfAttrValuesIds)
    if (addAttrValues.length > 0) {
      await this.prisma.spuAttrValue.createMany({
        data: addAttrValues.map(item => ({
          attrValueId: item,
          spuId: spuInfo.id
        }))
      })
    }
    if (deleteAttrValues.length > 0) {
      await this.prisma.spuAttrValue.deleteMany({
        where: {
          spuId: spuInfo.id,
          attrValueId: {
            in:deleteAttrValues
          }
        }
      })
    }
    //处理spuImage
    const isExistOfImages = await this.spuImageList(spuInfo.id)
    const isExistOfImageIds = isExistOfImages.map(item => item.url)
    const addImageUrls = filterDuplicates(isExistOfImageIds,spuImageList)
    const deleteImageUrls = filterDuplicates(spuImageList,isExistOfImageIds)
    if (addImageUrls.length > 0) {
      const addPromises = addImageUrls.map(async item => {
        const data:IUpdateTidDto = {
          type: 3,
          tid: spuInfo.id,
          logoUrl: item,
        }
        return this.fileService.addImageRelation(data);
      });
      const imageRelations = await Promise.all(addPromises);
      const imageIds = imageRelations.map(item => item.imageId)
      await this.prisma.spuImage.createMany({
        data: imageIds.map(item => ({
          imageId: item,
          spuId: spuInfo.id
        }))
      })
    }
    if (deleteImageUrls.length > 0) {
      const relationIdsPromises = deleteImageUrls.map(async url => {
        const body = {
          type: 3,
          tid: spuInfo.id,
          logoUrl: url
        }
        return this.fileService.selectImageRelationByUrl(body)
      })
      const relations = await Promise.all(relationIdsPromises);
      for (const relation of relations) {
        await this.fileService.removeImageRelation(relation.id)
      }
    }
    // 可使用Prisma客户端的事务功能执行所有操作，但这里暂时不会用
    return spu
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
   * @param id spuId
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