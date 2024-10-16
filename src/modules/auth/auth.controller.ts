import { Body, Controller, Get, Headers, Post, Req, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { extractToken } from 'src/utils';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { loginDto , ILoginDto } from './auth.dto';

@ApiBearerAuth()
@ApiTags('鉴权')
@Controller('index')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({summary:'登录'})
  @ApiBody({ type: loginDto })
  // 验证码要用 @UploadedFiles() files: Array<Express.Multer.File>
  async login(@Body() body: ILoginDto) {
    return await this.authService.login(body.username, body.password);
  }

  @Public()
  @Post('logout')
  @ApiOperation({summary:'退出'})
  @ApiHeaders([
    { name: 'Authorization', required: true, description: 'Bearer token for authentication' },
    { name: 'Token', required: false, description: 'The API Key used for authentication' },
  ])
  async logout(@Headers('Token') auth: string) {
    const token = extractToken(auth);
    return await this.authService.logout(token);
  }

  // @Get('info')
  // @ApiOperation({summary:'查看用户信息'})
  // info(@Req() request) {
  //   return this.authService.info(request);
  // }
  @Get('info')
  @ApiOperation({summary:'查看用户信息'})
  info() {
    return {
      routes: [
        'Acl',
        'Product'
      ],
      buttons: [
        'cuser.detail',
        'cuser.update',
        'cuser.delete',
        'btn.User.add',
        'btn.User.remove',
        'btn.User.update',
        'btn.User.assgin',
        'btn.Role.assgin',
        'btn.Role.add',
        'btn.Role.update',
        'btn.Role.remove',
        'btn.Permission.add',
        'btn.Permission.update',
        'btn.Permission.remove',
        'btn.Activity.add',
        'btn.Activity.update',
        'btn.Activity.rule',
        'btn.Coupon.add',
        'btn.Coupon.update',
        'btn.Coupon.rule',
        'btn.OrderList.detail',
        'btn.OrderList.Refund',
        'btn.UserList.lock',
        'btn.Category.add',
        'btn.Category.update',
        'btn.Category.remove',
        'btn.Trademark.add',
        'btn.Trademark.update',
        'btn.Trademark.remove',
        'btn.Attr.add',
        'btn.Attr.addSale',
        'btn.Attr.update',
        'btn.Attr.remove',
        'btn.Spu.add',
        'btn.Spu.addsku',
        'btn.Spu.update',
        'btn.Spu.skus',
        'btn.Spu.delete',
        'btn.Sku.updown',
        'btn.Sku.update',
        'btn.Sku.detail',
        'btn.Sku.remove',
        'btn.all'
      ],
      roles: ['超级管理员', 'gis数据工程师', '运维工程师', 'ui设计师', '实施工程师'],
      name: 'admin',
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    };
  }
}
