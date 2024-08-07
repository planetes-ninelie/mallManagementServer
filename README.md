# 硅谷甄选服务端项目
## 前端代码
```
https://gitee.com/youwei997/guiguzhenxuan-frontend
```
## 项目介绍
主要分为权限管理和商品管理两大模块。权限管理模块负责用户、角色以及菜单的管理，而商品管理模块则涵盖了商品分类、属性、SPU和SKU的管理。项目使用Redis作为缓存解决方案，实现服务端主动使token失效的功能。支持文件上传到本地文件（upload目录），使用eslint加prettier，统一代码风格。

- 权限管理
  - 用户管理
  - 角色管理
  - 菜单管理
- 商品管理
  - 品牌分类
  - 属性管理
  - spu管理
  - sku管理
## 技术栈

该项目主要使用 `nestjs`搭配`prisma`采用组件化的方式开发完成,此外项目中陆续使用有

- typescript
- mysql
- redis
- cache-manager
- multer
- jwt
- md5
- class-transformer
- class-validator

## 注意
本项目和教程的项目有一些区别，先看前端项目！！！！！！

## 前置
### nodejs
nodejs 最好使用18以上，本项目用的是20

### mysql
需要本地安装mysql，就是安装mysql，下一步，下一步。最好还有一个可视化工具navicat

### redis
需要本地安装redis，就是安装redis，下一步，下一步。如果没有可以把modules的auth文件夹下的auth.module.ts的24-30行注释

## 使用流程

### clone 本项目
```
git clone https://gitee.com/youwei997/guiguzhenxuan.git
```

### 使用pnpm安装，如果不是，需要在package.json把`packageManager`删除

```
pnpm i
```

### 在本地mysql创建一个 guiguzhenxuan 的数据库，使用sql或者navicat创建都行

### 使用prisma本地的schema创建表
```
npx prisma db push
```

### 使用navicat导入sql文件夹下的文件

### 运行

```
pnpm run dev
```