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
            children: [ProductModule, TrademarkModule, UploadModule],
          },
        ],
      },
    ]),
    RoleModule,
    MenuModule,
    TrademarkModule,
    UploadModule,
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
