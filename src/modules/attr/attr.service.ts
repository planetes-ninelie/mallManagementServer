import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICreateOrUpdateAttr } from './attr.dto';
import { CategoryService } from '../category/category.service';
import { findDuplicates } from '../../utils';

@Injectable()
export class AttrService {
  constructor(private readonly prisma: PrismaService,private readonly categoryService: CategoryService) {}

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
   * 删除属性同时会删除相应的属性值
   * @param id
   */
  deleteAttr(id: number) {
    return this.prisma.attr.delete({
      where: {
        id,
      },
    });
  }

  /**
   * 修改或添加属性
   * @param body
   */
  async saveAttrInfo(body: ICreateOrUpdateAttr) {
    const { attrValueIdList,updateHasIdAttrValueList }  = await this.addOrUpdateRole(body)
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
    if (deleteAttrValueIdList.length > 0) {
      attrValue.deleteMany = {
        where: {
          id: {
            in: deleteAttrValueIdList // 删除不在表单里的属性值
          }
        }
      }
    }
    if (newAttrValueList.length > 0) {
      attrValue.createMany = {
        data: newAttrValueList
      }
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
    if (attrValueNameList > 0) {
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
   * 根据id列表删除属性值
   * @param valueIdList
   */
  deleteAttrValueByIdList(valueIdList:number[]) {
    return this.prisma.attrValue.deleteMany({
      where: {
        id: {
          in: valueIdList
        }
      }
    })
  }

  /**
   * 新增和更新的规则
   * @param body
   * @return attrValueIdList 表单的属性值id列表
   */
  private async addOrUpdateRole(body: ICreateOrUpdateAttr) {
    const category = await this.categoryService.selectOne(body.categoryId);
    if (!category) {
      throw new HttpException(`分类id为${body.categoryId} 不存在！`, HttpStatus.OK);
    }
    if(category.level !== 3) {
      throw new HttpException(`分类名称 ${category.name} 不是三级分类！`, HttpStatus.OK);
    }
    const attr = await this.selectAttrByName(body.attrName,body.categoryId)
    const attrNameRole = (attr.length > 0 && !body.id) || (attr.length > 1 && body.id > 0)
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

}