import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryLevel } from './enum';
import { ICreateCategoryDto, IUpdateCategoryDto } from './category.dto';
import { formatDao, formatDateTime } from '../../utils';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 根据分类等级和分类id查子分类
   * @param level
   * @param id
   */
  getCategory(level: CategoryLevel,id:number = 0) {
    return this.prisma.category.findMany({
      where: {
        level,
        pid: id,
      },
    });
  }

  /**
   * 根据id查分类数据
   * @param id
   */
  selectOne(id: number) {
    return this.prisma.category.findUnique({
      where: {
        id
      }
    })
  }

  /**
   * 创建分类
   * @param body
   */
  async createCategory(body: ICreateCategoryDto) {
    await this.role(body)
    return this.prisma.category.create({
      data: body,
    })
  }

  /**
   * 更新分类的名称
   * @param body
   */
  async updateCategory(body: IUpdateCategoryDto) {
    await this.checkName(body)
    const {id, ...item} = body
    return this.prisma.category.update({
      where: {
        id
      },
      data: {
        ...item
      },
    })
  }

  /**
   * 根据id删除分类以及子分类
   * @param id
   */
  async deleteCategory(id: number) {
    const targetIds = await this.selectChildrenIdList([id])
    const relationOfAttr = await this.prisma.Attr.findMany({
      where: {
        categoryId: {
          in: targetIds
        }
      },
      select: {
        attrName: true
      }
    })
    if (relationOfAttr.length > 0) {
      const attrNames = relationOfAttr.map((item) => item.attrName)
      throw new HttpException(`存在与属性${attrNames.join(',')}关联，请先删除关联`,HttpStatus.OK)
    }
    const relationOfSpu = await this.prisma.Spu.findMany({
      where: {
        categoryId: {
          in: targetIds
        }
      },
      select: {
        spuName: true
      }
    })
    if (relationOfSpu.length > 0) {
      const spuNames = relationOfSpu.map((item) => item.spuName)
      throw new HttpException(`存在与spu${spuNames.join(',')}关联，请先删除关联`,HttpStatus.OK)
    }
    return this.deleteByIds(targetIds)
  }

  /**
   * 根据id列表进行删除
   * @param ids
   */
  private deleteByIds(ids: number[]) {
    return this.prisma.category.deleteMany({
      where: {
        id : {
          in: ids
        }
      }
    })
  }

  /**
   * 根据id列表查子id列表
   * @private
   * @param ids
   */
  private async selectIdById(ids: number[]) {
    const category = await this.prisma.category.findMany({
      where: {
        pid:{
          in: ids
        }
      },
      select: {
        id:true
      }
    })
    return category.map(category => category.id)
  }

  /**
   * 根据分类等级查询分类以及子孩子
   * @param level
   */
  async getCategoryByLevel(level: number) {
    const that = this
    const categoryList = await this.prisma.category.findMany({
      where: {
        level
      }
    })
    const formatCategoryList = formatDao(categoryList)
    async function findChildren(categoryList,level) {
      for (const category of categoryList) {
        level = category.level + 1
        category.children = await that.getCategory(level, category.id)
        category.createTime = formatDateTime(category.createTime)
        category.updateTime = formatDateTime(category.updateTime)
        await findChildren(category.children, level)
      }
    }
    await findChildren(formatCategoryList, level)
    return formatCategoryList
  }

  /**
   * 新增或修改的分类规则
   * @param body
   * @private
   */
  private async role(body) {
    await this.checkName(body)
    if(body.level > 3 || body.level < 1) {
      throw new HttpException(`请重新输入正确的分类等级：1、2、3，您输入的是${body.level}`,HttpStatus.OK)
    }
    const categoryByPid = await this.prisma.category.findFirst({
      where: {
        id: body.pid
      }
    })
    if (body.pid === 0 && body.level === 1) {
      return
    }
    if (body.pid === 0 && body.level !== 1) {
      throw new HttpException('请重新输入正确的level，当pid=0时，分类等级应该为1',HttpStatus.OK)
    }
    if(!categoryByPid) {
      throw new HttpException('请重新输入正确的pid，数据库里没有该id作为父id',HttpStatus.OK)
    }
    const levelRole = categoryByPid.level === (body.level - 1)
    if(!levelRole) {
      throw new HttpException('请重新输入正确的pid,父分类等级并不高于该分类等级一级',HttpStatus.OK)
    }
  }

  /**
   * 检查名字
   * @param body
   * @private
   */
  private async checkName(body) {
    const category = await this.prisma.category.findFirst({
      where: {
        name: body.name,
      }
    })
    if(category === undefined || category === null) {
      return
    }
    const nameRole = !(category || (category.name === body.name))
    if (nameRole) {
      throw new HttpException(`类型名称 ${category.name} 已存在，请重新输入新的类型名称`,HttpStatus.OK)
    }
  }

  /**
   * 递归查找子id，并返回数组
   * @param ids
   * @private
   */
  private async selectChildrenIdList(ids: number[]) {
    const that = this
    let targetArr = ids
    async function findChildrenIds(currentIds: number[]) {
      const childrenList = await that.selectIdById(currentIds)
      targetArr = targetArr.concat(childrenList)
      if (childrenList.length > 0) {
        await findChildrenIds(childrenList)
      }
    }
    await findChildrenIds(ids)
    return [...new Set(targetArr)]
  }
}