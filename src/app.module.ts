import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { MenuModule } from './modules/menu/menu.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductModule } from './modules/product/product.module';
import { RoleModule } from './modules/role/role.module';
import { TrademarkModule } from './modules/trademark/trademark.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/user/user.module';
import { FileModule } from './modules/file/file.module';
import { CategoryModule } from './modules/category/category.module';
import { AttrModule } from './modules/attr/attr.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    RouterModule.register([
      {
        path: 'admin',
        children: [
          {
            path: 'acl',
            children: [UserModule, RoleModule, MenuModule, AuthModule],
          },
          {
            path: 'product',
            children: [ProductModule, TrademarkModule,CategoryModule,AttrModule,UploadModule,FileModule],
          },
        ],
      },
    ]),
    RoleModule,
    MenuModule,
    TrademarkModule,
    CategoryModule,
    AttrModule,
    UploadModule,
    ProductModule,
    FileModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
