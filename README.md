# 项目介绍

悦购商城后台管理后端项目，用于管理员工的用户信息和职责分配以及设置权限，实现用户信息、角色信息和权限信息的增删查改，以及用户登录退出；同时也用于管理品牌和商品。

线上地址：http://8.138.108.50:2309

前端项目源码地址：https://github.com/planetes-ninelie/mallManagement.git

**注：本项目最初的版本是使用了不凡大佬的开源项目：https://gitee.com/youwei997/guiguzhenxuan-frontend，在此表示非常的感谢！本文最后会附上原项目的README.md**



**碎碎念：**

一开始这整个项目只有前端，后端接口是使用了尚硅谷提供的。因为尚硅谷的接口不稳定，总会出现接口崩掉的情况，数据也不可控。于是突发奇想，不如自己写个后端项目吧！原本是想用springboot来写后端服务的（以前学过一点皮毛），但是既然选择前端，那不如用前端框架来写后端服务？查阅了一番资料没想到还真有！比如有用express来写的，但是想了想，菜鸟单独从零开始直接完成一整个比较大的项目不那么现实。于是，从b站评论区翻一番有没有后端开源项目，没想到还真有，找到了不凡大佬的项目，这便开启了新的一段代码旅程。

克隆项目后，按照大佬的使用流程，成功启动了后端服务。经过一番测试，发现是有不少可以优化的地方，然后开始爆改。从设计数据库和利用prisma构建数据关系，到每一个模块每一个接口，一步步的思考怎么写更合理。这个过程花费了不少时间，有空的时候一不小心就写上了一天，写着写着就突然想到之前的写还可以优化，然后思绪就在这来回穿梭，还是挺享受这一过程。当接口写完并且测试发现没有问题的时候，那种满满成就感扑面而来。就这样，目前这个后端项目基本已经完成了，可以说与原项目完全是不一样的。

在写后端项目之前，前端是基本写好的，因为不太想改动前端内容，于是**后端就基本延续的原本的接口**，实在没办法**才会对原接口规定进行更改**。在此基础上，也**写了额外的接口**（就是玩，小小拓展一下），比如商品分类管理和图片管理；也**对原先接口新增一些字段**，比如角色的描述和角色的所拥有用户。此外，也写了swagger方便用于查看与原项目的区别和测试，具体用法在下文提及。

——2024.10.12



### 技术栈

node.js + nest.js + prisma + mysql + md5 + typeScript + swagger



### 使用流程

1. 安装依赖

   ```
   pnpm i
   ```

2. 使用prisma本地的schema创建表

   ```
   npx prisma db push
   ```

3. 安装mySQL和可视化工具（如navicat），然后在可视化工具里将根目录下sql文件夹的sql文件导入生成数据库

4. 运行项目

   ```
   pnpm run dev
   ```

5. 使用swagger文档

   项目启动后可以在浏览器登录：http://localhost:2306/doc ，然后在Authorize输入以下token值：

   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
   ```

   登录成功后可以正常使用测试接口

​	**注意：**`npx prisma db push`不要在项目运行时使用，否则会报错

![swagger](https://fastly.jsdelivr.net/gh/planetes-ninelie/assets/swagger%E6%96%87%E6%A1%A3.png)



### 目前已知问题：

前端：

- CSS样式没有做多端适配，目前只有在电脑浏览器上体验相对良好
- ts类型声明混乱，得重新整理
- 许多数据处理逻辑混乱

后端：

- 分页查询有问题，会有重复的数据显示（数据库没问题）
- 许多数据处理逻辑混乱

### 未来计划：

tip：相对容易达到，但最近较忙

- 实现一个免登录访问（游客访问），但是无权限对已有的数据进行修改和删除，不过可以自行增加数据
- 新增登录验证码
- 角色管理列表新增角色拥有的权限值显示（后端接口已写好，差前端页面显示）
- 角色管理列表新增“用户所属”字段，用于查看每一个角色下有哪些用户（后端接口已写好，差前端页面显示）
- 权限（菜单）管理提供一个权限值参考表格查看，因为前端页面每个按钮都是固定的权限值，权限值对不上按钮是无法使用的
- 新增图片管理模块，用于管理用户头像、品牌图标、sku商品图片列表（没搞错的话，后端接口基本写好，差前端页面显示）
- 新增操作日志模块，用于查看不同用户对数据库的操作记录，包括操作时间、调用的接口、状态码、以及接口返回的信息（没弄过，不知道好不好弄，试试看吧）

遥远的计划：

- 对图片管理进行优化，因为目前是不管图片是否最终使用，都会先存入数据库，感觉这种做法很笨，应该利用缓存会好些（也就是Redis？目前对这一块不了解，只是往这方面思考了，以后修改的时候再看看吧）
- 实现一个用户账号只能同时在一个设备上登录

### 结语：

该项目只是我的一些练习成果，还有许多需要优化的地方(尤其是对数据的处理，写了一坨屎山，自己也看笑了)，也有我暂未发现的问题，之后会慢慢改起来的。




# 附：以下是原项目的README.md，非常感谢大佬的开源项目！！！

## 硅谷甄选服务端项目

### 前端代码
```
https://gitee.com/youwei997/guiguzhenxuan-frontend
```
### 项目介绍
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
### 技术栈

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

### 注意
本项目和教程的项目有一些区别，先看前端项目！！！！！！

### 前置
#### nodejs
nodejs 最好使用18以上，本项目用的是20

#### mysql
需要本地安装mysql，就是安装mysql，下一步，下一步。最好还有一个可视化工具navicat

#### redis
需要本地安装redis，就是安装redis，下一步，下一步。如果没有可以把modules的auth文件夹下的auth.module.ts的24-30行注释

### 使用流程

#### clone 本项目

```
git clone https://gitee.com/youwei997/guiguzhenxuan.git
```

#### 使用pnpm安装，如果不是，需要在package.json把`packageManager`删除

```
pnpm i
```

#### 在本地mysql创建一个 guiguzhenxuan 的数据库，使用sql或者navicat创建都行

#### 使用prisma本地的schema创建表
```
npx prisma db push
```

#### 使用navicat导入sql文件夹下的文件

#### 运行

```
pnpm run dev
```