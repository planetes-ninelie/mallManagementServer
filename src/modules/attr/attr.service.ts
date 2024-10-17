import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICreateOrUpdateAttr } from './attr.dto';
import { CategoryService } from '../category/category.service';
import { findDuplicates } from '../../utils';

@Injectable()
export class AttrService {
  constructor(private readonly prisma: PrismaService,
              private readonly categoryService: CategoryService) {}

  /**
   * 获取属性列表
   * @param categoryFirstId
   * @param categorySecondId
   * @param categoryThirdId
   */
  async attrInfoList(categoryFirstId: number, categorySecondId: number, categoryThirdId: number) {
    const result = await this.prisma.attr.findMany({
      where: {
        categoryId: categoryThirdId,
      },
      orderBy: {
        createTime: 'desc',
      },
      include: {
        attrValue: true,
      },
    });

    // 将attrValue改成前端用的attrValueList
    return result.map(({ attrValue, ...item }) => ({
      ...item,
      attrValueList: attrValue,
    }));
  }

  /**
   * 查询所有销售属性
   */
  async saleAttrInfoList() {
    const result = await this.prisma.attr.findMany({
      where: {
        type: 2
      },
      orderBy: {
        createTime: 'desc',
      },
      include: {
        attrValue: true,
      },
    });

    // 将attrValue改成前端用的attrValueList
    return result.map(({ attrValue, ...item }) => ({
      ...item,
      attrValueList: attrValue,
    }));
  }

  /**
   * 删除属性同时会删除相应的属性值以及与spu的关系
   * @param id 属性id
   */
  async deleteAttr(id: number) {
    const attrValues = await this.findAttrValuesByAttrId(id)
    const attrValueIds = attrValues.map(item => item.id);
    const deleteSpuAttr = this.prisma.spuAttr.deleteMany({
      where: {
        attrId: id
      }
    })
    if (attrValueIds.length > 0) {
      await this.prisma.spuAttrValue.deleteMany({
        where: {
          attrValueId: {
            in: attrValueIds,
          }
        }
      })
      await this.prisma.skuAttrValue.deleteMany({
        where: {
          attrValueId: {
            in: attrValueIds,
          }
        }
      })
      await this.prisma.attrValue.deleteMany({
        where: {
          id: {
            in: attrValueIds
          }
        }
      })
    }
    const deleteAttr = this.prisma.attr.delete({
      where: {
        id,
      },
    });
    return await this.prisma.$transaction([
      deleteSpuAttr,deleteAttr])
  }

  /**
   * 修改或添加属性
   * @param body
   * @param type
   */
  async saveAttrInfo(body: ICreateOrUpdateAttr,type:number) {
    const { attrValueIdList,updateHasIdAttrValueList }  = await this.addOrUpdateRole(body,type)
    const newAttrValueList = body.attrValueList
      .filter(({ id }) => id === undefined)
      .map(({ flag, attrId, id, ...rest }) => ({ ...rest }));
    const setNewList = new Set(attrValueIdList);
    const deleteAttrValueIdList = []
    if (body.id) {
      const oldAttrValueList = await this.selectAttrValueByName(body.id)
      oldAttrValueList.forEach(({ id }) => {
        if (!setNewList.has(id)) {
          deleteAttrValueIdList.push(id);
        }
      });
    }
    const attrData = {
      attrName: body.attrName,
      categoryId: body.categoryId,
      type: type
    };
    const data = {
      where: { id: body?.id || 0 },
      update: {
        ...attrData,
        attrValue: {}
      },
      create: {
        ...attrData,
        attrValue: {
          create: body.attrValueList.map(({ flag, attrId, ...rest }) => rest),
        },
      },
      include: {
        attrValue: true,
      },
    }
    const attrValue = data.update.attrValue
    if (newAttrValueList.length > 0) {
      attrValue.createMany = {
        data: newAttrValueList
      }
    }
    if (deleteAttrValueIdList.length > 0) {
      await this.prisma.attrValue.deleteMany({
        where: {
          id: {
            in: deleteAttrValueIdList // 删除不在表单里的属性值
          }
        }
      })
    }
    if (updateHasIdAttrValueList.length > 0) {
      for (const { id, ...rest } of updateHasIdAttrValueList) {
        await this.prisma.attrValue.update({
          where:{
            id
          },
          data: {
            ...rest
          }
        })
      }
    }
    return await this.prisma.attr.upsert(data);
  }

  /**
   * 根据属性名称和三级分类id查询
   * @param attrName
   * @param categoryId
   */
  selectAttrByName(attrName: string,categoryId:number) {
    return this.prisma.attr.findMany({
      where: {
        attrName,
        categoryId
      }
    })
  }

  /**
   * 根据属性id和属性值列表查询
   * @param attrId
   * @param attrValueNameList
   */
  selectAttrValueByName(attrId: number, attrValueNameList:string[] = []) {
    const data = {
      where: {
        attrId
      }
    }
    if (attrValueNameList.length > 0) {
      data.where.valueName = {
        in:attrValueNameList
      }
    }
    return this.prisma.attrValue.findMany(data)
  }

  /**
   * 根据属性值id查属性值
   * @param valueId
   */
  selectAttrValueById(valueId: number) {
    return this.prisma.attrValue.findUnique({
      where:{
        id:valueId
      }
    })
  }

  /**
   * 新增和更新的规则
   * @param body
   * @param type
   * @return attrValueIdList 表单的属性值id列表
   */
  private async addOrUpdateRole(body: ICreateOrUpdateAttr,type:number) {
    if (type === 1) {
      const category = await this.categoryService.selectOne(body.categoryId);
      if (!category) {
        throw new HttpException(`分类id为${body.categoryId} 不存在！`, HttpStatus.OK);
      }
      if (category.level !== 3) {
        throw new HttpException(`分类名称 ${category.name} 不是三级分类！`, HttpStatus.OK);
      }
    }

    let attrs
    if(type === 1) {
      attrs = await this.selectAttrByName(body.attrName,body.categoryId)
    } else {
      attrs = await this.findBySaleName(body.attrName,2)
    }
    const attrNameRole = (attrs.length > 0 && body.id === 0) || (attrs.length > 1 && body.id > 0)
    if (attrNameRole) {
      throw new HttpException(`属性名称 ${body.attrName} 已存在！`, HttpStatus.OK);
    }

    const attrValueIdList:number[] = []
    const createAndUpdateAttrValueNameList = []
    const updateHasIdAttrValueList = []
    for (const item of body.attrValueList) {
      if (!item.id) {
        createAndUpdateAttrValueNameList.push(item.valueName) ;
      } else {
        attrValueIdList.push(item.id)
        const value = await this.selectAttrValueById(item.id)
        if (item.valueName !== value.valueName) {
          createAndUpdateAttrValueNameList.push(item.valueName);
          const {flag, ...rest} = item
          updateHasIdAttrValueList.push({ ...rest })
        }
      }
    }
    const duplicates = findDuplicates(createAndUpdateAttrValueNameList)
    if (duplicates.length > 0) {
      throw new HttpException(`出现重复值 ${duplicates} `,HttpStatus.OK);
    }
    if (createAndUpdateAttrValueNameList.length > 0) {
      const existAttrValueNameList = (await this.selectAttrValueByName(body.id,createAndUpdateAttrValueNameList)).map(item => item.valueName)
      if (existAttrValueNameList.length > 0 && body.id) {
        throw new HttpException(`属性值名称 ${existAttrValueNameList} 已存在！`, HttpStatus.OK);
      }
    }
    return { attrValueIdList,updateHasIdAttrValueList }
  }

  /**
   * 根据属性名字和type查询属性数据
   * @param name
   * @param type
   * @private
   */
  private async findBySaleName(name:string,type) {
    return this.prisma.attr.findMany({
      where: {
        attrName: name,
        type
      }
    })
  }

  /**
   * 根据attrId查询attrValue数据列表
   * @param attrId
   */
  findAttrValuesByAttrId(attrId:number) {
    return this.prisma.attrValue.findMany({
      where: {
        attrId
      }
    })
  }
}