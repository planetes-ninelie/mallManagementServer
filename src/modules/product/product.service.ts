import { Injectable } from '@nestjs/common';
import { Sku, Spu } from '@prisma/client';
import { successList } from 'src/utils/response';
import { PrismaService } from '../prisma/prisma.service';
import { ICreateOrUpdateAttr, SkuInfo, SpuInfo } from './interface';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}
  /* sku相关 */

  /**
   * 新增sku
   * @param skuInfo sku信息
   * @returns 新增sku信息
   */
  saveSkuInfo(skuInfo: SkuInfo): Promise<Sku> {
    return this.prisma.sku.create({
      data: {
        ...skuInfo,
        // 价格和重量转成数值
        price: parseFloat(skuInfo.price),
        weight: parseFloat(skuInfo.weight),
        // 处理sku属性值
        skuAttrValueList: {
          create: skuInfo.skuAttrValueList.map((item) => {
            return {
              // 属性id
              attrId: parseInt(item.attrId, 10),
              // 属性值id
              valueId: parseInt(item.valueId, 10),
            };
          }),
        },
        // 处理销售属性值
        skuSaleAttrValueList: {
          create: skuInfo.skuSaleAttrValueList.map((item) => {
            return {
              // 销售属性id
              saleAttrId: parseInt(item.saleAttrId, 10),
              // 销售属性值id
              saleAttrValueId: parseInt(item.saleAttrValueId, 10),
            };
          }),
        },
        skuImageList: {
          create: skuInfo.skuImageList,
        },
      },
    });
  }

  // 获取sku列表
  async findSkuList(pageNum: number, pageSize: number) {
    const { skuList, count } = await this.prisma.$transaction(async (prisma) => {
      return {
        skuList: await prisma.sku.findMany({
          skip: (pageNum - 1) * pageSize,
          take: pageSize,
          orderBy: {
            createTime: 'desc',
          },
        }),
        count: await prisma.sku.count(),
      };
    });

    // 返回分页信息和查询结果
    return successList<Sku>(skuList, { pageNum, pageSize, count });
  }

  // 上架sku
  onSale(skuId: number) {
    return this.prisma.sku.update({
      where: {
        id: skuId,
      },
      data: {
        isSale: 1,
      },
    });
  }

  // 下架sku
  cancelSale(skuId: number) {
    return this.prisma.sku.update({
      where: {
        id: skuId,
      },
      data: {
        isSale: 0,
      },
    });
  }

  // 删除sku
  deleteSku(id: number) {
    return this.prisma.sku.delete({
      where: {
        id,
      },
    });
  }

  /* spu相关 */
  // 删除spu
  deleteSpu(id: number) {
    return this.prisma.spu.delete({
      where: {
        id,
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
   * @param spuInfo - 包含SPU信息的对象
   * @returns 返回一个Promise，该Promise在事务完成后解析，包含创建的SPU数据
   */
  saveSpuInfo(spuInfo: SpuInfo) {
    return this.prisma.spu.create({
      data: {
        // 基础信息
        ...spuInfo,
        // 图片列表
        spuImageList: {
          create: spuInfo.spuImageList,
        },
        // 销售属性列表
        spuSaleAttrList: {
          create: spuInfo.spuSaleAttrList.map((item) => {
            return {
              // 销售属性ID
              baseSaleAttrId: item.baseSaleAttrId,
              // 销售属性名称
              saleAttrName: item.saleAttrName,
              // 销售属性值列表
              spuSaleAttrValueList: {
                create: item.spuSaleAttrValueList,
              },
            };
          }),
        },
      },
    });
  }

  // 获取spu列表
  async findSpuAll(pageNum: number, pageSize: number, category3Id: number) {
    const { spuList, count } = await this.prisma.$transaction(async (prisma) => {
      return {
        spuList: await prisma.spu.findMany({
          skip: (pageNum - 1) * pageSize, // 跳过指定数量的品牌以实现分页
          take: pageSize, // 返回指定数量的品牌
          where: {
            category3Id,
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

  // 基础spu属性
  baseSaleAttrList() {
    return this.prisma.baseSaleAttr.findMany();
  }

  // 查找spu下的sku列表
  findBySpuId(id: number) {
    return this.prisma.sku.findMany({
      where: {
        spuId: id,
      },
    });
  }

  // 查找spu的图片列表
  spuImageList(id: number) {
    return this.prisma.spuImg.findMany({
      where: {
        spuId: id,
      },
    });
  }

  // 查找spu属性列表
  spuSaleAttrList(id: number) {
    return this.prisma.saleAttr.findMany({
      where: {
        spuId: id,
      },
      include: {
        spuSaleAttrValueList: true,
      },
    });
  }

  /* 属性相关 */
  // 获取属性列表
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
    const attrList = result.map(({ attrValue, ...item }) => ({
      ...item,
      attrValueList: attrValue,
    }));

    return attrList;
  }

  // 删除属性
  deleteAttr(id: number) {
    return this.prisma.attr.delete({
      where: {
        id,
      },
    });
  }

  // 修改或添加属性
  async saveAttrInfo(body: ICreateOrUpdateAttr) {
    const attrData = {
      attrName: body.attrName,
      categoryId: body.categoryId,
      categoryLevel: body.categoryLevel,
    };

    const result = await this.prisma.attr.upsert({
      where: { id: body?.id || 0 },
      update: {
        ...attrData,
        attrValue: {
          deleteMany: {}, // 删除现有属性值
          createMany: {
            data: body.attrValueList.map(({ flag, attrId, ...rest }) => rest),
          },
        },
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
    });

    return result;
  }

  /* 获取sku详情 */
  // coze 优化
  /**
   * 获取sku详情
   * @param skuId sku id
   * @returns sku详情
   */
  async getSkuInfo(skuId: number) {
    // 1. 根据skuId查询sku信息
    const skuInfoPromise = this.prisma.sku.findUnique({
      where: { id: skuId },
      include: {
        skuAttrValueList: true,
        skuSaleAttrValueList: true,
      },
    });

    // 2. 查询sku图片列表，并和spu图片列表匹配，获取sku图片详情
    const skuImageListDataPromise = this.prisma.skuImg.findMany({
      where: { skuId: skuId },
    });

    const [skuInfo, skuImageListData] = await Promise.all([skuInfoPromise, skuImageListDataPromise]);

    // 3. 查询spu图片列表
    const spuImgListData = await this.prisma.spuImg.findMany({
      where: { spuId: skuInfo.spuId },
    });

    // 4. 查询属性列表，属性值列表，销售属性列表，销售属性值列表
    const attrPromise = this.prisma.attr.findMany();
    const attrValuePromise = this.prisma.attrValue.findMany();
    const saleAttrPromise = this.prisma.saleAttr.findMany();
    const saleAttrValuePromise = this.prisma.saleAttrValue.findMany();

    const [spuAttrListData, spuAttrValueListData, spuSaleAttrListData, spuSaleAttrValueListData] = await Promise.all([attrPromise, attrValuePromise, saleAttrPromise, saleAttrValuePromise]);

    // 5. 将sku属性值列表和属性值列表匹配，获取属性名和属性值名
    const skuAttrValueList = skuInfo.skuAttrValueList
      .flatMap((skuAttr) => {
        return spuAttrListData.flatMap((spuAttr) => {
          if (skuAttr.attrId === spuAttr.id) {
            return spuAttrValueListData
              .filter((spuAttrValue) => skuAttr.valueId === spuAttrValue.id)
              .map((spuAttrValue) => ({
                ...skuAttr,
                attrName: spuAttr.attrName,
                valueName: spuAttrValue.valueName,
              }));
          }
        });
      })
      .filter(Boolean); // 过滤掉null值;

    // 6. 将sku销售属性值列表和销售属性值列表匹配，获取销售属性名和销售属性值名
    const skuSaleAttrValueList = skuInfo.skuSaleAttrValueList
      .flatMap((skuSaleAttr) => {
        return spuSaleAttrListData.flatMap((spuSaleAttr) => {
          if (skuSaleAttr.saleAttrId === spuSaleAttr.id) {
            return spuSaleAttrValueListData
              .filter((spuSaleAttrValue) => skuSaleAttr.saleAttrValueId === spuSaleAttrValue.id)
              .map((spuSaleAttrValue) => ({
                ...skuSaleAttr,
                saleAttrName: spuSaleAttr.saleAttrName,
                saleAttrValueName: spuSaleAttrValue.saleAttrValueName,
              }));
          }
        });
      })
      .filter(Boolean); // 过滤掉null值;

    // 7. 返回sku图片列表
    const skuImageList = skuImageListData.flatMap((item) => {
      return spuImgListData
        .map((item2) => {
          if (item.spuImgId === item2.id) {
            return {
              ...item,
              imgUrl: item2.imgUrl,
              imgName: item2.imgName,
            };
          }
        })
        .filter(Boolean);
    });

    return {
      ...skuInfo,
      skuImageList,
      skuAttrValueList,
      skuSaleAttrValueList,
    };
  }

  // 原始版本
  // async getSkuInfo(skuId: number) {
  //   const skuInfo = await this.prisma.sku.findUnique({
  //     where: {
  //       id: skuId,
  //     },
  //     include: {
  //       skuAttrValueList: true,
  //       skuSaleAttrValueList: true,
  //     },
  //   });

  //   // 查询sku的图片表（只存了对应spu图片的id）
  //   const skuImageListData = await this.prisma.skuImg.findMany({
  //     where: {
  //       skuId: skuId,
  //     },
  //   });

  //   // 查询spu图片表
  //   const spuImgListData = await this.prisma.spuImg.findMany({
  //     where: {
  //       spuId: skuInfo.spuId,
  //     },
  //   });

  //   // 组装图片列表，将sku图片表的id与spu图片表的id进行匹配
  //   const skuImageList = skuImageListData.flatMap((item) => {
  //     return spuImgListData
  //       .map((item2) => {
  //         if (item.spuImgId === item2.id) {
  //           return {
  //             ...item,
  //             imgUrl: item2.imgUrl,
  //             imgName: item2.imgName,
  //           };
  //         }
  //       })
  //       .filter(Boolean); // remove undefined values
  //   });

  //   // 查询attr表，获取属性名
  //   const spuAttrListData = await this.prisma.attr.findMany();
  //   // 查询attrValue表，获取属性值
  //   const spuAttrValueListData = await this.prisma.attrValue.findMany();

  //   // 组装平台属性
  //   const skuAttrValueList = [];
  //   for (const skuAttr of skuInfo.skuAttrValueList) {
  //     // console.log(skuAttr);
  //     for (const spuAttr of spuAttrListData) {
  //       // console.log(spuAttr);
  //       if (skuAttr.attrId === spuAttr.id) {
  //         for (const spuAttrValue of spuAttrValueListData) {
  //           // console.log(spuAttr);
  //           if (skuAttr.valueId === spuAttrValue.id) {
  //             skuAttrValueList.push({
  //               ...skuAttr,
  //               attrName: spuAttr.attrName,
  //               valueName: spuAttrValue.valueName,
  //             });
  //           }
  //         }
  //       }
  //     }
  //   }

  //   // 查询saleAttr，获取销售属性名
  //   const spuSaleAttrListData = await this.prisma.saleAttr.findMany();
  //   // 查询saleAttrValue，获取销售属性值
  //   const spuSaleAttrValueListData = await this.prisma.saleAttrValue.findMany();

  //   // 组装销售属性
  //   const skuSaleAttrValueList = [];
  //   for (const skuSaleAttr of skuInfo.skuSaleAttrValueList) {
  //     for (const spuSaleAttr of spuSaleAttrListData) {
  //       if (skuSaleAttr.saleAttrId === spuSaleAttr.id) {
  //         for (const spuSaleAttrValue of spuSaleAttrValueListData) {
  //           if (skuSaleAttr.saleAttrValueId === spuSaleAttrValue.id) {
  //             skuSaleAttrValueList.push({
  //               ...skuSaleAttr,
  //               saleAttrName: spuSaleAttr.saleAttrName,
  //               saleAttrValueName: spuSaleAttrValue.saleAttrValueName,
  //             });
  //           }
  //         }
  //       }
  //     }
  //   }

  //   const result = {
  //     ...skuInfo,
  //     skuImageList,
  //     skuAttrValueList,
  //     skuSaleAttrValueList,
  //   };

  //   return result;
  // }

  // codiumate 优化
  // async getSkuInfo(skuId: number) {
  //   const skuInfo = await this.prisma.sku.findUnique({
  //     where: {
  //       id: skuId,
  //     },
  //     include: {
  //       skuAttrValueList: true,
  //       skuSaleAttrValueList: true,
  //     },
  //   });

  //   const skuImageListData = await this.prisma.skuImg.findMany({
  //     where: {
  //       skuId: skuId,
  //     },
  //   });

  //   const spuImgListData = await this.prisma.spuImg.findMany({
  //     where: {
  //       spuId: skuInfo.spuId,
  //     },
  //   });

  //   const skuImageList = skuImageListData.flatMap((item) => {
  //     const spuImg = spuImgListData.find((spuImg) => spuImg.id === item.spuImgId);
  //     if (spuImg) {
  //       return {
  //         ...item,
  //         imgUrl: spuImg.imgUrl,
  //         imgName: spuImg.imgName,
  //       };
  //     }
  //   });

  //   const spuAttrListData = await this.prisma.attr.findMany();
  //   const spuAttrValueListData = await this.prisma.attrValue.findMany();

  //   const skuAttrValueList = skuInfo.skuAttrValueList.flatMap((skuAttr) => {
  //     const spuAttr = spuAttrListData.find((attr) => attr.id === skuAttr.attrId);
  //     const spuAttrValue = spuAttrValueListData.find((attrValue) => attrValue.id === skuAttr.valueId);
  //     if (spuAttr && spuAttrValue) {
  //       return {
  //         ...skuAttr,
  //         attrName: spuAttr.attrName,
  //         valueName: spuAttrValue.valueName,
  //       };
  //     }
  //   });

  //   const spuSaleAttrListData = await this.prisma.saleAttr.findMany();
  //   const spuSaleAttrValueListData = await this.prisma.saleAttrValue.findMany();

  //   const skuSaleAttrValueList = skuInfo.skuSaleAttrValueList.flatMap((skuSaleAttr) => {
  //     const spuSaleAttr = spuSaleAttrListData.find((saleAttr) => saleAttr.id === skuSaleAttr.saleAttrId);
  //     const spuSaleAttrValue = spuSaleAttrValueListData.find((saleAttrValue) => saleAttrValue.id === skuSaleAttr.saleAttrValueId);
  //     if (spuSaleAttr && spuSaleAttrValue) {
  //       return {
  //         ...skuSaleAttr,
  //         saleAttrName: spuSaleAttr.saleAttrName,
  //         saleAttrValueName: spuSaleAttrValue.saleAttrValueName,
  //       };
  //     }
  //   });

  //   const result = {
  //     ...skuInfo,
  //     skuImageList,
  //     skuAttrValueList,
  //     skuSaleAttrValueList,
  //   };

  //   return result;
  // }

  // bing copilot优化
  // async getSkuInfo(skuId) {
  //   const skuInfo = await this.prisma.sku.findUnique({
  //     where: {
  //       id: skuId,
  //     },
  //     include: {
  //       skuAttrValueList: true,
  //       skuSaleAttrValueList: true,
  //     },
  //   });

  //   const spuId = skuInfo.spuId;

  //   const [skuImageListData, spuImgListData, spuAttrListData, spuAttrValueListData, spuSaleAttrListData, spuSaleAttrValueListData] = await Promise.all([
  //     this.prisma.skuImg.findMany({
  //       where: {
  //         skuId: skuId,
  //       },
  //     }),
  //     this.prisma.spuImg.findMany({
  //       where: {
  //         spuId: spuId,
  //       },
  //     }),
  //     this.prisma.attr.findMany(),
  //     this.prisma.attrValue.findMany(),
  //     this.prisma.saleAttr.findMany(),
  //     this.prisma.saleAttrValue.findMany(),
  //   ]);

  //   const skuImageList = skuImageListData
  //     .map((item) => {
  //       const matchingSpuImg = spuImgListData.find((item2) => item.spuImgId === item2.id);
  //       if (matchingSpuImg) {
  //         return {
  //           ...item,
  //           imgUrl: matchingSpuImg.imgUrl,
  //           imgName: matchingSpuImg.imgName,
  //         };
  //       }
  //     })
  //     .filter(Boolean);

  //   const getAttributeData = (attrId, valueId, attrList, valueList) => {
  //     const matchingAttr = attrList.find((attr) => attr.id === attrId);
  //     const matchingValue = valueList.find((value) => value.id === valueId);
  //     return {
  //       attrName: matchingAttr?.attrName,
  //       valueName: matchingValue?.valueName,
  //     };
  //   };

  //   const skuAttrValueList = skuInfo.skuAttrValueList.map((skuAttr) => {
  //     return {
  //       ...skuAttr,
  //       ...getAttributeData(skuAttr.attrId, skuAttr.valueId, spuAttrListData, spuAttrValueListData),
  //     };
  //   });

  //   const skuSaleAttrValueList = skuInfo.skuSaleAttrValueList.map((skuSaleAttr) => {
  //     return {
  //       ...skuSaleAttr,
  //       ...getAttributeData(skuSaleAttr.saleAttrId, skuSaleAttr.saleAttrValueId, spuSaleAttrListData, spuSaleAttrValueListData),
  //     };
  //   });

  //   const result = {
  //     ...skuInfo,
  //     skuImageList,
  //     skuAttrValueList,
  //     skuSaleAttrValueList,
  //   };

  //   return result;
  // }
}
